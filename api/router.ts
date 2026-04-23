import { authRouter } from "./auth-router";
import { propertyRouter } from "./property-router";
import { customerRouter } from "./customer-router";
import { transactionRouter } from "./transaction-router";
import { leadRouter } from "./lead-router";
import { documentRouter } from "./document-router";
import { userRouter } from "./user-router";
import { reportRouter } from "./report-router";
import { searchRouter } from "./search-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  property: propertyRouter,
  customer: customerRouter,
  transaction: transactionRouter,
  lead: leadRouter,
  document: documentRouter,
  user: userRouter,
  report: reportRouter,
  search: searchRouter,
});

export type AppRouter = typeof appRouter;
