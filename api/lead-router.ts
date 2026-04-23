import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, publicQuery, managerQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { leads } from "@db/schema";
import { TRPCError } from "@trpc/server";

export const leadRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]).optional(),
        assignedAgentId: z.number().optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const offset = (input.page - 1) * input.limit;
      const conditions = [];

      if (input.status) conditions.push(eq(leads.status, input.status));
      if (input.assignedAgentId) conditions.push(eq(leads.assignedAgentId, input.assignedAgentId));
      if (input.search) {
        conditions.push(
          sql`(${leads.name} LIKE ${`%${input.search}%`} OR ${leads.email} LIKE ${`%${input.search}%`} OR ${leads.phone} LIKE ${`%${input.search}%`})`
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db.query.leads.findMany({
        where,
        orderBy: [desc(leads.createdAt)],
        limit: input.limit,
        offset,
        with: { assignedAgent: true },
      });

      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(leads)
        .where(where);

      return { items, total: countResult[0]?.count ?? 0, page: input.page, limit: input.limit };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const lead = await db.query.leads.findFirst({
        where: eq(leads.id, input.id),
        with: { assignedAgent: true },
      });
      if (!lead) throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found" });
      return lead;
    }),

  create: publicQuery
    .input(
      z.object({
        source: z.string().default("WEBSITE"),
        name: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        message: z.string().optional(),
        interestedIn: z.array(z.string()).optional(),
        budget: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const data: any = { ...input };
      if (input.interestedIn) data.interestedIn = JSON.stringify(input.interestedIn);
      if (input.budget !== undefined) data.budget = String(input.budget);
      const result = await db.insert(leads).values(data);
      return { success: true, id: Number((result as any).insertId) };
    }),

  update: managerQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        message: z.string().optional(),
        status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]).optional(),
        interestedIn: z.array(z.string()).optional(),
        budget: z.number().optional(),
        assignedAgentId: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.interestedIn) updateData.interestedIn = JSON.stringify(data.interestedIn);
      if (data.budget !== undefined) updateData.budget = String(data.budget);
      await db.update(leads).set(updateData).where(eq(leads.id, id));
      return { success: true };
    }),

  updateStatus: managerQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(leads).set({ status: input.status }).where(eq(leads.id, input.id));
      return { success: true };
    }),
});
