// src/server/api/routers/timeEntries.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Prisma } from "@prisma/client";
import { 
  fromZonedTime, 
  toZonedTime 
} from "date-fns-tz";
import { 
  addDays, 
  differenceInMilliseconds, 
  startOfWeek, 
  endOfWeek, 
  parseISO,
  format
} from "date-fns";
import { TRPCError } from "@trpc/server";

// Helper to get user's timezone, with a fallback
const getUserTimeZone = (user: { timeZone?: string | null }): string => {
  return user.timeZone ?? "UTC"; // Fallback to UTC if not set
};

export const timeEntriesRouter = createTRPCRouter({
  // This procedure remains largely the same, good for a raw data dump.
  get: protectedProcedure.query(async ({ ctx }) => {
    const timeEntries = await ctx.db.timeEntry.findMany({
      orderBy: { startDateTime: "desc" },
      where: { userId: ctx.session.user.id },
      include: {
        company: true,
      },
    });
    return timeEntries;
  }),

  // --- REFACTORED: getByWeek ---
  getByWeek: protectedProcedure
    .input(
      z.object({
        // The client sends ANY date within the desired week.
        // The server will calculate the start/end of that week.
        dateInWeek: z.string().date("Invalid date format (expected YYYY-MM-DD)"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userTimeZone = getUserTimeZone(ctx.session.user);
      const targetDate = parseISO(`${input.dateInWeek}T00:00:00.000Z`);

      // Calculate the start and end of the week in the USER's timezone
      // NOTE: `date-fns` `startOfWeek` assumes Sunday is the start.
      // Pass { weekStartsOn: 1 } for Monday.
      const weekStartLocal = startOfWeek(targetDate, { weekStartsOn: 1 });
      const weekEndLocal = endOfWeek(targetDate, { weekStartsOn: 1 });
      
      const timeEntries = await ctx.db.timeEntry.findMany({
        orderBy: { startDateTime: "asc" }, // Ascending is usually better for display
        where: {
          userId: ctx.session.user.id,
          // Query the pre-calculated entryDate field for performance!
          entryDate: {
            gte: weekStartLocal,
            lte: weekEndLocal,
          },
        },
        include: {
          company: true,
        }
      });
      return timeEntries;
    }),

  // --- REFACTORED: upsert ---
  upsert: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(), // Pass ID if you are editing
        // Client should send local time as an ISO string WITHOUT timezone info
        // e.g., "2023-10-27T09:00:00"
        startDateTimeLocal: z.string().datetime({ message: "Invalid start datetime" }),
        endDateTimeLocal: z.string().datetime({ message: "Invalid end datetime" }),
        breakMinutes: z.number().int().min(0).optional(),
        companyId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // --- 1. Get TimeZone & Convert Local Inputs to UTC ---
      const userTimeZone = getUserTimeZone(ctx.session.user);

      // `fromZonedTime` correctly interprets a "local" time string as being in a specific zone
      // and returns the corresponding UTC Date object.
      let startDateTimeUtc = fromZonedTime(input.startDateTimeLocal, userTimeZone);
      let endDateTimeUtc = fromZonedTime(input.endDateTimeLocal, userTimeZone);
      
      // --- 2. Handle Overnight Shifts ---
      // If the resulting end time is before or at the start time, it must be the next day.
      if (endDateTimeUtc <= startDateTimeUtc) {
        endDateTimeUtc = addDays(endDateTimeUtc, 1);
      }
      
      // --- 3. Calculate Duration & Earnings ---
      const breakMs = (input.breakMinutes ?? 0) * 60 * 1000;
      const totalMs = differenceInMilliseconds(endDateTimeUtc, startDateTimeUtc) - breakMs;

      if (totalMs < 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End time must be after start time, even with breaks.",
        });
      }

      const totalHours = totalMs / (1000 * 60 * 60);

      // For now, let's assume a simple rate. The rate logic can be complex.
      // TODO: Implement your detailed rate-finding logic here if needed.
      const rate = 100.0; // Placeholder
      const earnings = totalHours * rate;
      
      // --- 4. Determine the 'entryDate' for Filtering ---
      // This is the most important new piece. We find what "day" the shift started on
      // in the user's local timezone, and store that day's date at midnight UTC.
      const localStartDate = toZonedTime(startDateTimeUtc, userTimeZone);
      const entryDate = fromZonedTime(format(localStartDate, 'yyyy-MM-dd'), userTimeZone);

      // --- 5. Prepare Data for Prisma (using Decimal) ---
      const dataToUpsert = {
        userId: ctx.session.user.id,
        companyId: input.companyId,
        startDateTime: startDateTimeUtc,
        endDateTime: endDateTimeUtc,
        entryDate: entryDate,
        breakMinutes: input.breakMinutes ?? 0,
        totalTime: new Prisma.Decimal(totalHours.toFixed(4)),
        earnings: new Prisma.Decimal(earnings.toFixed(2)),
      };

      // --- 6. Upsert Data ---
      if (input.id) {
        // If an ID is provided, it's an update
        return ctx.db.timeEntry.update({
          where: { id: input.id },
          data: dataToUpsert,
        });
      } else {
        // Otherwise, create a new entry
        return ctx.db.timeEntry.create({
          data: dataToUpsert,
        });
      }
    }),
});