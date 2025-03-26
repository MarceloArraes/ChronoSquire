import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { type TimeEntry } from "@prisma/client";

export const timeEntriesRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const timeEntries = await ctx.db.timeEntry.findMany({
      orderBy: { date: "desc" },
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
        orderBy: { date: "desc" },
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
        startTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM (24h format)
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        breakMinutes: z.number().optional(),
        companyId: z.string(),
      }),
    )
    .output(z.custom<TimeEntry>()) // Add explicit output type
    .mutation(async ({ ctx, input }) => {
      const entryDate = new Date(input.date);
      const startTime = new Date(`1970-01-01T${input.startTime}:00`);
      const endTime = new Date(`1970-01-01T${input.endTime}:00`);
      // const breakTime = new Date(`1970-01-01T${input.breakTime}:00`);

      const startDateTime = new Date(entryDate);
      startDateTime.setHours(startTime.getHours(), startTime.getMinutes());
      const endDateTime = new Date(entryDate);
      endDateTime.setHours(endTime.getHours(), endTime.getMinutes());

      if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }

      const nightStart = new Date(entryDate);
      nightStart.setHours(22, 0, 0, 0); // 10 PM

      const nightEnd = new Date(nightStart);
      nightEnd.setDate(nightEnd.getDate() + 1);
      nightEnd.setHours(6, 0, 0, 0); // 6 AM next day

      const isNightShift = startDateTime < nightEnd && endDateTime > nightStart;

      const rate = await ctx.db.hourlyRate.findFirst({
        where: {
          userId: ctx.session.user.id,
          companyId: input.companyId,
          dayOfWeek: entryDate.getDay(),
          isNightShift: isNightShift,
        },
        include: {
          Company: true,
        },
      });

      const breakMs = (input.breakMinutes ?? 0) * 60 * 1000; // Convert minutes to milliseconds
      const totalMs = endDateTime.getTime() - startDateTime.getTime() - breakMs;
      const totalTime = totalMs / (1000 * 60 * 60); // Convert to hours

      let earnings = 0;
      if (rate) {
        earnings = totalTime * Number(rate.rate);
      } else {
        console.log("No rate found for this entry:", {
          userId: ctx.session.user.id,
          companyId: input.companyId,
        });
      }

      const roundedTotalTime = Math.round(totalTime * 100) / 100;
      const roundedEarnings = Math.round(earnings * 100) / 100;

      const result = await ctx.db.timeEntry.upsert({
        where: {
          user_company_shift_unique: {
            userId: ctx.session.user.id,
            date: entryDate,
            startTime: startTime,
            companyId: input.companyId,
          },
        },
        create: {
          userId: ctx.session.user.id,
          date: new Date(input.date),
          startTime: startTime,
          endTime: endTime,
          companyId: input.companyId,
          breakMinutes: input.breakMinutes,
          earnings: roundedEarnings,
          totalTime: roundedTotalTime,
        },
        update: {
          startTime: startTime,
          endTime: endTime,
          breakMinutes: input.breakMinutes ?? 0,
          earnings: roundedEarnings,
          totalTime: roundedTotalTime,
        },
      });

      return result;
    }),
});
