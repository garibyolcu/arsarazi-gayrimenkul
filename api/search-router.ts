import { z } from "zod";
import { like, or } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { properties, customers } from "@db/schema";

export const searchRouter = createRouter({
  search: publicQuery
    .input(
      z.object({
        q: z.string().min(1),
        type: z.enum(["properties", "customers", "all"]).default("all"),
        limit: z.number().default(10),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const term = `%${input.q}%`;
      const results: { properties: any[]; customers: any[] } = { properties: [], customers: [] };

      if (input.type === "all" || input.type === "properties") {
        results.properties = await db.query.properties.findMany({
          where: or(
            like(properties.title, term),
            like(properties.description, term),
            like(properties.city, term),
            like(properties.district, term)
          ),
          limit: input.limit,
          with: { images: true },
        });
      }

      if (input.type === "all" || input.type === "customers") {
        results.customers = await db.query.customers.findMany({
          where: or(
            like(customers.firstName, term),
            like(customers.lastName, term),
            like(customers.email, term),
            like(customers.phone, term),
            like(customers.city, term)
          ),
          limit: input.limit,
          with: { assignedAgent: true },
        });
      }

      return results;
    }),
});
