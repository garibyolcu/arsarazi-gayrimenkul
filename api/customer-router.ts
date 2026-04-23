import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery, managerQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { customers, customerNotes, transactions } from "@db/schema";
import { TRPCError } from "@trpc/server";

export const customerRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        type: z.enum(["BUYER", "SELLER", "RENTER", "LANDLORD", "INVESTOR"]).optional(),
        source: z.enum(["REFERRAL", "WEBSITE", "SOCIAL_MEDIA", "WALK_IN", "OTHER"]).optional(),
        agentId: z.number().optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const offset = (input.page - 1) * input.limit;
      const conditions = [];

      if (input.type) conditions.push(eq(customers.type, input.type));
      if (input.source) conditions.push(eq(customers.source, input.source));
      if (input.agentId) conditions.push(eq(customers.assignedAgentId, input.agentId));
      if (input.search) {
        conditions.push(
          sql`(${customers.firstName} LIKE ${`%${input.search}%`} OR ${customers.lastName} LIKE ${`%${input.search}%`} OR ${customers.email} LIKE ${`%${input.search}%`})`
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db.query.customers.findMany({
        where,
        orderBy: [desc(customers.createdAt)],
        limit: input.limit,
        offset,
        with: { assignedAgent: true },
      });

      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(customers)
        .where(where);

      return { items, total: countResult[0]?.count ?? 0, page: input.page, limit: input.limit };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const customer = await db.query.customers.findFirst({
        where: eq(customers.id, input.id),
        with: { assignedAgent: true, notes: true, documents: true },
      });
      if (!customer) throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      return customer;
    }),

  create: managerQuery
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        type: z.enum(["BUYER", "SELLER", "RENTER", "LANDLORD", "INVESTOR"]).default("BUYER"),
        companyName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        whatsapp: z.string().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        budgetMin: z.number().optional(),
        budgetMax: z.number().optional(),
        budgetCurrency: z.string().default("TRY"),
        source: z.enum(["REFERRAL", "WEBSITE", "SOCIAL_MEDIA", "WALK_IN", "OTHER"]).default("WALK_IN"),
        rating: z.number().min(1).max(5).optional(),
        assignedAgentId: z.number().optional(),
        preferences: z.object({
          propertyTypes: z.array(z.string()).optional(),
          districts: z.array(z.string()).optional(),
          features: z.array(z.string()).optional(),
        }).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const data: any = { ...input };
      if (input.preferences) data.preferences = JSON.stringify(input.preferences);
      if (input.budgetMin !== undefined) data.budgetMin = String(input.budgetMin);
      if (input.budgetMax !== undefined) data.budgetMax = String(input.budgetMax);
      const result = await db.insert(customers).values(data);
      return { success: true, id: Number((result as any).insertId) };
    }),

  update: managerQuery
    .input(
      z.object({
        id: z.number(),
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        type: z.enum(["BUYER", "SELLER", "RENTER", "LANDLORD", "INVESTOR"]).optional(),
        companyName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        whatsapp: z.string().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        budgetMin: z.number().optional(),
        budgetMax: z.number().optional(),
        budgetCurrency: z.string().optional(),
        source: z.enum(["REFERRAL", "WEBSITE", "SOCIAL_MEDIA", "WALK_IN", "OTHER"]).optional(),
        rating: z.number().min(1).max(5).optional(),
        assignedAgentId: z.number().optional(),
        preferences: z.any().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.preferences) updateData.preferences = JSON.stringify(data.preferences);
      if (data.budgetMin !== undefined) updateData.budgetMin = String(data.budgetMin);
      if (data.budgetMax !== undefined) updateData.budgetMax = String(data.budgetMax);
      await db.update(customers).set(updateData).where(eq(customers.id, id));
      return { success: true };
    }),

  delete: managerQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(customers).where(eq(customers.id, input.id));
      return { success: true };
    }),

  addNote: authedQuery
    .input(
      z.object({
        customerId: z.number(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.insert(customerNotes).values({
        customerId: input.customerId,
        content: input.content,
        authorId: ctx.user.id,
      });
      return { success: true };
    }),

  getTransactions: publicQuery
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const items = await db.query.transactions.findMany({
        where: eq(transactions.buyerId, input.customerId),
        with: { property: true, agent: true },
      });
      return items;
    }),
});
