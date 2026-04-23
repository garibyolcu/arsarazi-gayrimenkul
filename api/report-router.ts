import { eq, and, sql, gte } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { properties, transactions, customers, leads } from "@db/schema";

export const reportRouter = createRouter({
  dashboard: authedQuery.query(async () => {
    const db = getDb();

    const activeProperties = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(properties)
      .where(eq(properties.status, "ACTIVE"));

    const monthlyTransactions = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(transactions)
      .where(
        gte(transactions.createdAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1))
      );

    const totalCustomers = await db.select({ count: sql<number>`COUNT(*)` }).from(customers);

    const pendingTransactions = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.status, "CONTRACT"),
          gte(transactions.createdAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1))
        )
      );

    const totalCommission = await db
      .select({ total: sql<string>`SUM(CAST(${transactions.commission} AS DECIMAL(19,4)))` })
      .from(transactions)
      .where(eq(transactions.status, "CLOSED"));

    return {
      activeProperties: activeProperties[0]?.count ?? 0,
      monthlyTransactions: monthlyTransactions[0]?.count ?? 0,
      totalCustomers: totalCustomers[0]?.count ?? 0,
      pendingTransactions: pendingTransactions[0]?.count ?? 0,
      totalCommission: totalCommission[0]?.total ?? "0",
    };
  }),

  portfolio: authedQuery.query(async () => {
    const db = getDb();

    const byStatus = await db
      .select({
        status: properties.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(properties)
      .groupBy(properties.status);

    const byType = await db
      .select({
        type: properties.type,
        count: sql<number>`COUNT(*)`,
      })
      .from(properties)
      .groupBy(properties.type);

    const byCity = await db
      .select({
        city: properties.city,
        count: sql<number>`COUNT(*)`,
      })
      .from(properties)
      .where(sql`${properties.city} IS NOT NULL`)
      .groupBy(properties.city);

    return { byStatus, byType, byCity };
  }),

  transactionSummary: authedQuery.query(async () => {
    const db = getDb();

    const monthly = await db
      .select({
        month: sql<string>`DATE_FORMAT(${transactions.createdAt}, '%Y-%m')`,
        count: sql<number>`COUNT(*)`,
        totalCommission: sql<string>`SUM(CAST(${transactions.commission} AS DECIMAL(19,4)))`,
      })
      .from(transactions)
      .groupBy(sql`DATE_FORMAT(${transactions.createdAt}, '%Y-%m')`)
      .orderBy(sql`DATE_FORMAT(${transactions.createdAt}, '%Y-%m') DESC`)
      .limit(12);

    const byStatus = await db
      .select({
        status: transactions.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .groupBy(transactions.status);

    const byType = await db
      .select({
        type: transactions.type,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .groupBy(transactions.type);

    return { monthly, byStatus, byType };
  }),

  agentPerformance: authedQuery.query(async () => {
    const db = getDb();

    const byAgent = await db
      .select({
        agentId: transactions.agentId,
        count: sql<number>`COUNT(*)`,
        totalCommission: sql<string>`SUM(CAST(${transactions.commission} AS DECIMAL(19,4)))`,
      })
      .from(transactions)
      .where(eq(transactions.status, "CLOSED"))
      .groupBy(transactions.agentId)
      .orderBy(sql`COUNT(*) DESC`);

    const agentDetails = await db.query.users.findMany();

    return byAgent.map((row) => {
      const agent = agentDetails.find((a) => a.id === row.agentId);
      return {
        agentId: row.agentId,
        agentName: agent?.name ?? "Bilinmiyor",
        transactionCount: row.count,
        totalCommission: row.totalCommission ?? "0",
      };
    });
  }),

  customerSources: authedQuery.query(async () => {
    const db = getDb();

    const bySource = await db
      .select({
        source: customers.source,
        count: sql<number>`COUNT(*)`,
      })
      .from(customers)
      .groupBy(customers.source);

    const byStatus = await db
      .select({
        status: leads.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(leads)
      .groupBy(leads.status);

    return { bySource, byStatus };
  }),
});
