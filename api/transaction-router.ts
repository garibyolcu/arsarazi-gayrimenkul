import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery, managerQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { transactions, transactionNotes, transactionEvents } from "@db/schema";
import { TRPCError } from "@trpc/server";

export const transactionRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        status: z.enum(["LEAD", "NEGOTIATION", "OFFER", "CONTRACT", "CLOSED", "CANCELLED"]).optional(),
        type: z.enum(["SALE", "RENT", "LEASE", "VALUATION"]).optional(),
        agentId: z.number().optional(),
        propertyId: z.number().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const offset = (input.page - 1) * input.limit;
      const conditions = [];

      if (input.status) conditions.push(eq(transactions.status, input.status));
      if (input.type) conditions.push(eq(transactions.type, input.type));
      if (input.agentId) conditions.push(eq(transactions.agentId, input.agentId));
      if (input.propertyId) conditions.push(eq(transactions.propertyId, input.propertyId));

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db.query.transactions.findMany({
        where,
        orderBy: [desc(transactions.createdAt)],
        limit: input.limit,
        offset,
        with: { property: true, agent: true, buyer: true, seller: true },
      });

      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(transactions)
        .where(where);

      return { items, total: countResult[0]?.count ?? 0, page: input.page, limit: input.limit };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const transaction = await db.query.transactions.findFirst({
        where: eq(transactions.id, input.id),
        with: {
          property: true,
          agent: true,
          buyer: true,
          seller: true,
          renter: true,
          landlord: true,
          notes: { with: { author: true } },
          events: { with: { createdBy: true } },
          documents: true,
        },
      });
      if (!transaction) throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found" });
      return transaction;
    }),

  create: managerQuery
    .input(
      z.object({
        type: z.enum(["SALE", "RENT", "LEASE", "VALUATION"]).default("SALE"),
        status: z.enum(["LEAD", "NEGOTIATION", "OFFER", "CONTRACT", "CLOSED", "CANCELLED"]).default("LEAD"),
        propertyId: z.number().optional(),
        buyerId: z.number().optional(),
        sellerId: z.number().optional(),
        renterId: z.number().optional(),
        landlordId: z.number().optional(),
        agentId: z.number().optional(),
        agreedPrice: z.number().optional(),
        commission: z.number().optional(),
        commissionRate: z.number().optional(),
        contractDate: z.date().optional(),
        closingDate: z.date().optional(),
        handoverDate: z.date().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const data: any = { ...input };
      if (input.agreedPrice !== undefined) data.agreedPrice = String(input.agreedPrice);
      if (input.commission !== undefined) data.commission = String(input.commission);
      if (input.commissionRate !== undefined) data.commissionRate = String(input.commissionRate);
      if (!input.agentId) data.agentId = ctx.user.id;

      const result = await db.insert(transactions).values(data);
      const txId = Number((result as any).insertId);

      await db.insert(transactionEvents).values({
        transactionId: txId,
        eventType: "CREATED",
        description: "İşlem oluşturuldu.",
        createdById: ctx.user.id,
      });

      return { success: true, id: txId };
    }),

  update: managerQuery
    .input(
      z.object({
        id: z.number(),
        type: z.enum(["SALE", "RENT", "LEASE", "VALUATION"]).optional(),
        status: z.enum(["LEAD", "NEGOTIATION", "OFFER", "CONTRACT", "CLOSED", "CANCELLED"]).optional(),
        propertyId: z.number().optional(),
        buyerId: z.number().optional(),
        sellerId: z.number().optional(),
        renterId: z.number().optional(),
        landlordId: z.number().optional(),
        agentId: z.number().optional(),
        agreedPrice: z.number().optional(),
        commission: z.number().optional(),
        commissionRate: z.number().optional(),
        contractDate: z.date().optional(),
        closingDate: z.date().optional(),
        handoverDate: z.date().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.agreedPrice !== undefined) updateData.agreedPrice = String(data.agreedPrice);
      if (data.commission !== undefined) updateData.commission = String(data.commission);
      if (data.commissionRate !== undefined) updateData.commissionRate = String(data.commissionRate);
      await db.update(transactions).set(updateData).where(eq(transactions.id, id));
      return { success: true };
    }),

  updateStatus: managerQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["LEAD", "NEGOTIATION", "OFFER", "CONTRACT", "CLOSED", "CANCELLED"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db
        .update(transactions)
        .set({ status: input.status })
        .where(eq(transactions.id, input.id));

      await db.insert(transactionEvents).values({
        transactionId: input.id,
        eventType: "STATUS_CHANGE",
        description: `Durum güncellendi: ${input.status}`,
        createdById: ctx.user.id,
      });

      return { success: true };
    }),

  addNote: authedQuery
    .input(
      z.object({
        transactionId: z.number(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.insert(transactionNotes).values({
        transactionId: input.transactionId,
        content: input.content,
        authorId: ctx.user.id,
      });
      return { success: true };
    }),

  getTimeline: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const events = await db.query.transactionEvents.findMany({
        where: eq(transactionEvents.transactionId, input.id),
        orderBy: [desc(transactionEvents.eventDate)],
        with: { createdBy: true },
      });
      return events;
    }),
});
