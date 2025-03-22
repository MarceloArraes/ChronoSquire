import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { type HourlyRate } from "@prisma/client";

export const hourlyRateRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const hourlyRates = await ctx.db.hourlyRate.findMany({
      orderBy: { dayOfWeek: "desc" },
      where: { userId: ctx.session.user.id },
    });
    return hourlyRates ?? null;
  }),

  //   upsert: protectedProcedure
  //     .input(
  //       z.object({
  //         day_of_week: z.number().int().min(0).max(6),
  //         is_night_shift: z.boolean(),
  //         rate: z.number().positive(),
  //       }),
  //     )
  //     .mutation(async ({ ctx, input }) => {
  //       // Upsert using PostgreSQL's ON CONFLICT syntax
  //       return ctx.db.query(
  //         `INSERT INTO hourly_rates (user_id, day_of_week, is_night_shift, rate)
  //          VALUES ($1, $2, $3, $4)
  //          ON CONFLICT (user_id, day_of_week, is_night_shift)
  //          DO UPDATE SET rate = EXCLUDED.rate
  //          RETURNING *`,
  //         [
  //           ctx.session.user.id,
  //           input.day_of_week,
  //           input.is_night_shift,
  //           input.rate,
  //         ],
  //       );
  //     }),

  upsert: protectedProcedure
    .input(
      z.object({
        day_of_week: z.number().int().min(0).max(6),
        is_night_shift: z.boolean(),
        rate: z.number().positive(),
      }),
    )
    .output(z.custom<HourlyRate>()) // Add explicit output type
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.hourlyRate.upsert({
        where: {
          user_day_shift_unique: {
            userId: ctx.session.user.id,
            dayOfWeek: input.day_of_week,
            isNightShift: input.is_night_shift,
          },
        },
        create: {
          userId: ctx.session.user.id,
          dayOfWeek: input.day_of_week,
          isNightShift: input.is_night_shift,
          rate: input.rate,
        },
        update: {
          rate: input.rate,
        },
      });

      return result;
    }),
});
