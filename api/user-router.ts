import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { createRouter, adminQuery, managerQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { TRPCError } from "@trpc/server";

export const userRouter = createRouter({
  list: managerQuery
    .input(
      z.object({
        role: z.enum(["ADMIN", "MANAGER", "AGENT", "VIEWER"]).optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const offset = (input.page - 1) * input.limit;
      const conditions = [];

      if (input.role) conditions.push(eq(users.role, input.role));
      if (input.search) {
        conditions.push(
          sql`(${users.name} LIKE ${`%${input.search}%`} OR ${users.email} LIKE ${`%${input.search}%`})`
        );
      }

      const where = conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined;

      const items = await db.query.users.findMany({
        where: where as any,
        orderBy: [desc(users.createdAt)],
        limit: input.limit,
        offset,
      });

      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(users)
        .where(where as any);

      return { items, total: countResult[0]?.count ?? 0, page: input.page, limit: input.limit };
    }),

  getById: managerQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const user = await db.query.users.findFirst({
        where: eq(users.id, input.id),
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      return user;
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        role: z.enum(["ADMIN", "MANAGER", "AGENT", "VIEWER"]).optional(),
        phone: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(users).set(data).where(eq(users.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(users).where(eq(users.id, input.id));
      return { success: true };
    }),
});
