import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { type TimeEntry } from "@prisma/client";

export const timeEntriesRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const timeEntries = await ctx.db.timeEntry.findMany({
      orderBy: { date: "desc" },
      where: { userId: ctx.session.user.id },
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
      }),
    )
    .output(z.custom<TimeEntry>()) // Add explicit output type
    .mutation(async ({ ctx, input }) => {
      const entryDate = new Date(input.date);
      const startTime = new Date(`1970-01-01T${input.startTime}:00`);
      const endTime = new Date(`1970-01-01T${input.endTime}:00`);

      if (startTime >= endTime) {
        throw new Error("Start time must be before end time");
      }

      const result = await ctx.db.timeEntry.upsert({
        where: {
          user_day_start_end: {
            userId: ctx.session.user.id,
            date: entryDate,
            startTime: startTime,
            endTime: endTime,
          },
        },
        create: {
          userId: ctx.session.user.id,
          date: new Date(input.date),
          startTime: startTime,
          endTime: endTime,
        },
        update: {
          startTime: startTime,
          endTime: endTime,
        },
      });

      return result;
    }),
});
