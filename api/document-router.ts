import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, publicQuery, managerQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { documents } from "@db/schema";
import { TRPCError } from "@trpc/server";

export const documentRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        type: z.enum(["TITLE_DEED", "POWER_OF_ATTORNEY", "CONTRACT", "ID_COPY", "FLOOR_PLAN", "VALUATION_REPORT", "OTHER"]).optional(),
        propertyId: z.number().optional(),
        customerId: z.number().optional(),
        transactionId: z.number().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const offset = (input.page - 1) * input.limit;
      const conditions = [];

      if (input.type) conditions.push(eq(documents.type, input.type));
      if (input.propertyId) conditions.push(eq(documents.propertyId, input.propertyId));
      if (input.customerId) conditions.push(eq(documents.customerId, input.customerId));
      if (input.transactionId) conditions.push(eq(documents.transactionId, input.transactionId));

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db.query.documents.findMany({
        where,
        orderBy: [desc(documents.createdAt)],
        limit: input.limit,
        offset,
        with: { property: true, customer: true, transaction: true, uploadedBy: true },
      });

      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(documents)
        .where(where);

      return { items, total: countResult[0]?.count ?? 0, page: input.page, limit: input.limit };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const doc = await db.query.documents.findFirst({
        where: eq(documents.id, input.id),
        with: { property: true, customer: true, transaction: true, uploadedBy: true },
      });
      if (!doc) throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      return doc;
    }),

  create: managerQuery
    .input(
      z.object({
        type: z.enum(["TITLE_DEED", "POWER_OF_ATTORNEY", "CONTRACT", "ID_COPY", "FLOOR_PLAN", "VALUATION_REPORT", "OTHER"]).default("OTHER"),
        name: z.string().min(1),
        description: z.string().optional(),
        fileUrl: z.string().url(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
        tags: z.array(z.string()).optional(),
        propertyId: z.number().optional(),
        customerId: z.number().optional(),
        transactionId: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const data: any = { ...input };
      if (input.tags) data.tags = JSON.stringify(input.tags);
      data.uploadedById = ctx.user.id;
      const result = await db.insert(documents).values(data);
      return { success: true, id: Number((result as any).insertId) };
    }),

  update: managerQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        type: z.enum(["TITLE_DEED", "POWER_OF_ATTORNEY", "CONTRACT", "ID_COPY", "FLOOR_PLAN", "VALUATION_REPORT", "OTHER"]).optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.tags) updateData.tags = JSON.stringify(data.tags);
      await db.update(documents).set(updateData).where(eq(documents.id, id));
      return { success: true };
    }),

  delete: managerQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(documents).where(eq(documents.id, input.id));
      return { success: true };
    }),

  verify: managerQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db
        .update(documents)
        .set({ isVerified: true, verifiedAt: new Date(), verifiedById: ctx.user.id })
        .where(eq(documents.id, input.id));
      return { success: true };
    }),
});
