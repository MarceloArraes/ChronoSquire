import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { type TimeEntry } from "@prisma/client";
import { format, fromZonedTime } from "date-fns-tz";
import { parse, addDays, differenceInMilliseconds, getDay } from "date-fns";

export const timeEntriesRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const timeEntries = await ctx.db.timeEntry.findMany({
      orderBy: { startDateTime: "desc" },
      where: { userId: ctx.session.user.id },
      include: {
        company: true,
      },
    });
    return timeEntries ?? null;
  }),

  getByWeek: protectedProcedure
    .input(
      z.object({
        initialDate: z
          .string()
          .regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "Invalid date format (expected YYYY-MM-DD)",
          )
          .optional(),
        endDate: z
          .string()
          .regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "Invalid date format (expected YYYY-MM-DD)",
          )
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Build a date filter dynamically.
      const dateFilter: { gte?: Date; lte?: Date } = {};
      if (input.initialDate) {
        dateFilter.gte = new Date(input.initialDate); // converts "YYYY-MM-DD" to a Date at midnight
      }
      if (input.endDate) {
        // Append time to cover the whole day.
        dateFilter.lte = new Date(input.endDate + "T23:59:59.999Z");
      }

      const timeEntries = await ctx.db.timeEntry.findMany({
        orderBy: { startDateTime: "desc" },
        where: {
          userId: ctx.session.user.id,
          ...(Object.keys(dateFilter).length && { date: dateFilter }),
        },
      });
      return timeEntries;
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
        startTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM (local to userTimeZone)
        endTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM (local to userTimeZone)
        breakMinutes: z.number().optional(),
        companyId: z.string(),
        isOvernightShift: z.boolean().optional(),
      }),
    )
    // *** Ensure this output type matches your REAL Prisma schema ***
    .output(z.custom<TimeEntry>())
    .mutation(async ({ ctx, input }) => {
      // --- 1. Define TimeZone and Parse Local Inputs ---
      const userTimeZone = "Australia/Adelaide"; // Get dynamically later if needed
      const entryDateString = input.date;
      const startTimeString = input.startTime;
      const endTimeString = input.endTime;

      // Parse the combined string assuming it represents time in userTimeZone
      const startDateTimeLocalGuess = parse(
        `${entryDateString} ${startTimeString}`,
        "yyyy-MM-dd HH:mm",
        new Date(),
      );
      const endDateTimeLocalGuess = parse(
        `${entryDateString} ${endTimeString}`,
        "yyyy-MM-dd HH:mm",
        new Date(),
      );

      // --- 2. Convert Guessed Local Times to Actual UTC Times ---
      // *** USE fromZonedTime ***
      const startDateTimeUtc = fromZonedTime(
        startDateTimeLocalGuess,
        userTimeZone,
      );
      let endDateTimeUtc = fromZonedTime(endDateTimeLocalGuess, userTimeZone);

      console.log("Raw Input:", input);
      console.log("Start Local Guess:", startDateTimeLocalGuess);
      console.log("End Local Guess:", endDateTimeLocalGuess);
      console.log("Start UTC:", startDateTimeUtc);
      console.log("End UTC:", endDateTimeUtc);

      // --- 3. Handle Overnight Shift (using UTC dates) ---
      if (input.isOvernightShift || endDateTimeUtc <= startDateTimeUtc) {
        // Add a day to the UTC end time
        endDateTimeUtc = addDays(endDateTimeUtc, 1);
        console.log("Adjusted End UTC (Overnight):", endDateTimeUtc);
      }

      // --- 4. Calculate Duration (using UTC dates) ---
      const breakMs = (input.breakMinutes ?? 0) * 60 * 1000;
      const totalMs =
        differenceInMilliseconds(endDateTimeUtc, startDateTimeUtc) - breakMs;
      const totalTime = totalMs / (1000 * 60 * 60); // Hours
      const roundedTotalTime = Math.round(totalTime * 100) / 100;
      console.log("Total Time (Hours):", roundedTotalTime);

      // --- 5. Determine Day of Week & Night Shift for Rate ---
      // Use the START time in the user's local zone to determine the relevant day/shift for the rate
      const startDateTimeInUserZone = fromZonedTime(
        startDateTimeUtc,
        userTimeZone,
      );
      const dayOfWeekForRate = getDay(startDateTimeInUserZone); // 0=Sun, 1=Mon,...

      // Night shift check based on userTimeZone (e.g., 10 PM to 6 AM Local)
      // Need the date part relevant to the start time in the local zone
      const localDatePartForNightCheck = format(
        startDateTimeInUserZone,
        "yyyy-MM-dd",
        { timeZone: userTimeZone },
      );

      const nightStartLocal = parse(
        `${localDatePartForNightCheck} 22:00`,
        "yyyy-MM-dd HH:mm",
        new Date(),
      );
      const nightEndLocal = parse(
        `${localDatePartForNightCheck} 06:00`,
        "yyyy-MM-dd HH:mm",
        new Date(),
      );

      const nightStartUtc = fromZonedTime(nightStartLocal, userTimeZone);
      const nightEndUtc = fromZonedTime(
        addDays(nightEndLocal, 1),
        userTimeZone,
      ); // 6 AM next day

      // Check if the interval [startDateTimeUtc, endDateTimeUtc) overlaps [nightStartUtc, nightEndUtc)
      const isNightShift =
        startDateTimeUtc < nightEndUtc && endDateTimeUtc > nightStartUtc;

      console.log("Rate Check Timezone:", userTimeZone);
      console.log("Rate Check Day:", dayOfWeekForRate);
      console.log("Rate Check isNightShift:", isNightShift);

      // --- 6. Fetch Rate ---
      const rate = await ctx.db.hourlyRate.findFirst({
        where: {
          userId: ctx.session.user.id,
          companyId: input.companyId,
          dayOfWeek: dayOfWeekForRate,
          isNightShift: isNightShift,
        },
      });

      // --- 7. Calculate Earnings ---
      let earnings = 0;
      if (rate) {
        earnings = roundedTotalTime * Number(rate.rate);
      } else {
        console.log("!!! No rate found !!!");
      }
      const roundedEarnings = Math.round(earnings * 100) / 100;
      console.log("Earnings:", roundedEarnings);

      // --- 8. Upsert Data ---
      // *** CRITICAL: Update Prisma Schema & Database ***
      // Change columns from `date`, `startTime`, `endTime` to `entryDate`, `startDateTime`, `endDateTime`
      // Ensure `startDateTime` and `endDateTime` are `DateTime` type in Prisma / Timestamp WITH Timezone in DB.
      // Update your `@@unique` constraint.
      const result = await ctx.db.timeEntry.upsert({
        where: {
          // *** Use your NEW unique constraint (adjust name) ***
          user_company_start_unique: {
            userId: ctx.session.user.id,
            companyId: input.companyId,
            startDateTime: startDateTimeUtc, // The actual UTC start timestamp
          },
        },
        create: {
          userId: ctx.session.user.id,
          companyId: input.companyId,
          // Store the day the entry *starts* on, as UTC midnight, for easy range queries
          entryDate: fromZonedTime(input.date, "UTC"),
          startDateTime: startDateTimeUtc,
          endDateTime: endDateTimeUtc,
          breakMinutes: input.breakMinutes ?? 0,
          earnings: roundedEarnings.toString(), // Or use Decimal type
          totalTime: roundedTotalTime.toString(), // Or use Decimal type
        },
        update: {
          // Only update things that might change if the start time is the same
          endDateTime: endDateTimeUtc,
          breakMinutes: input.breakMinutes ?? 0,
          earnings: roundedEarnings.toString(),
          totalTime: roundedTotalTime.toString(),
        },
        // *** Include company data ONLY if needed by the frontend from this call ***
        // include: { company: true }
      });

      console.log("Upsert Result:", result);

      // --- 9. Return Result ---
      return result; // Prisma returns Date objects; tRPC serializes them.
    }),
});
