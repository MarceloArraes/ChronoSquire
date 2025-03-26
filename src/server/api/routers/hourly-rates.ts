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

  upsert: protectedProcedure
    .input(
      z.object({
        day_of_week: z.number().int().min(0).max(6),
        is_night_shift: z.boolean(),
        rate: z.number().positive(),
        companyId: z.string(),
      }),
    )
    .output(z.custom<HourlyRate>()) // Add explicit output type
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.hourlyRate.upsert({
        where: {
          user_company_day_shift_unique: {
            userId: ctx.session.user.id,
            dayOfWeek: input.day_of_week,
            isNightShift: input.is_night_shift,
            companyId: input.companyId,
          },
        },
        create: {
          userId: ctx.session.user.id,
          dayOfWeek: input.day_of_week,
          isNightShift: input.is_night_shift,
          rate: input.rate,
          companyId: input.companyId,
        },
        update: {
          rate: input.rate,
        },
      });

      return result;
    }),
});
