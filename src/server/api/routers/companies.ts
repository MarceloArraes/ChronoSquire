import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { type Company } from "@prisma/client";

export const companyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        address: z.string().optional(),
        phone: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const createdCompany = await ctx.db.company.create({
          data: {
            ...input,
            userId: ctx.session.user.id,
          },
        });
        return createdCompany as Company;
      } catch (error) {
        console.log("error", error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create company",
        });
      }
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      return (await ctx.db.company.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
      })) as Company[];
    } catch (error) {
      console.log("error", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch companies",
      });
    }
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const company = await ctx.db.company.findUnique({
          where: { id: input.id },
        });

        if (!company) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Company not found",
          });
        }

        if (company.userId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to delete this company",
          });
        }

        const deletedCompany = await ctx.db.company.delete({
          where: { id: input.id },
        });
        return deletedCompany;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete company",
        });
      }
    }),
});
