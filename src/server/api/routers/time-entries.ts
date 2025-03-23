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
