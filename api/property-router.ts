import { z } from "zod";
import { eq, and, gte, lte, like, desc, asc, sql } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery, managerQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { properties, propertyImages } from "@db/schema";
import { TRPCError } from "@trpc/server";

const propertyFilterSchema = z.object({
  status: z.enum(["ACTIVE", "PASSIVE", "POTENTIAL", "SOLD", "RENTED"]).optional(),
  type: z.enum(["APARTMENT", "HOUSE", "LAND", "COMMERCIAL", "OFFICE", "WAREHOUSE"]).optional(),
  listingType: z.enum(["SALE", "RENT"]).optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  agentId: z.number().optional(),
  search: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
  sortBy: z.enum(["createdAt", "price", "views"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const propertyRouter = createRouter({
  list: publicQuery
    .input(propertyFilterSchema)
    .query(async ({ input }) => {
      const db = getDb();
      const offset = (input.page - 1) * input.limit;

      const conditions = [];
      if (input.status) conditions.push(eq(properties.status, input.status));
      if (input.type) conditions.push(eq(properties.type, input.type));
      if (input.listingType) conditions.push(eq(properties.listingType, input.listingType));
      if (input.city) conditions.push(like(properties.city, `%${input.city}%`));
      if (input.district) conditions.push(like(properties.district, `%${input.district}%`));
      if (input.minPrice !== undefined) conditions.push(gte(properties.price, String(input.minPrice)));
      if (input.maxPrice !== undefined) conditions.push(lte(properties.price, String(input.maxPrice)));
      if (input.agentId) conditions.push(eq(properties.agentId, input.agentId));
      if (input.search) {
        conditions.push(
          sql`(${properties.title} LIKE ${`%${input.search}%`} OR ${properties.description} LIKE ${`%${input.search}%`})`
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const orderBy =
        input.sortBy === "price"
          ? input.sortOrder === "asc"
            ? asc(properties.price)
            : desc(properties.price)
          : input.sortBy === "views"
            ? input.sortOrder === "asc"
              ? asc(properties.views)
              : desc(properties.views)
            : input.sortOrder === "asc"
              ? asc(properties.createdAt)
              : desc(properties.createdAt);

      const items = await db.query.properties.findMany({
        where,
        orderBy,
        limit: input.limit,
        offset,
        with: { images: true, agent: true },
      });

      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(properties)
        .where(where);
      const total = countResult[0]?.count ?? 0;

      return { items, total, page: input.page, limit: input.limit };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const property = await db.query.properties.findFirst({
        where: eq(properties.id, input.id),
        with: { images: true, agent: true, owner: true, documents: true },
      });
      if (!property) throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
      return property;
    }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const property = await db.query.properties.findFirst({
        where: eq(properties.slug, input.slug),
        with: { images: true, agent: true, owner: true },
      });
      if (!property) throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
      await db
        .update(properties)
        .set({ views: (property.views ?? 0) + 1 })
        .where(eq(properties.id, property.id));
      return property;
    }),

  create: managerQuery
    .input(
      z.object({
        title: z.string().min(3),
        description: z.string().optional(),
        slug: z.string().min(3),
        status: z.enum(["ACTIVE", "PASSIVE", "POTENTIAL", "SOLD", "RENTED"]).default("ACTIVE"),
        type: z.enum(["APARTMENT", "HOUSE", "LAND", "COMMERCIAL", "OFFICE", "WAREHOUSE"]).default("APARTMENT"),
        listingType: z.enum(["SALE", "RENT"]).default("SALE"),
        price: z.number().positive(),
        currency: z.string().default("TRY"),
        area: z.number().optional(),
        netArea: z.number().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        roomCount: z.number().optional(),
        bathroomCount: z.number().optional(),
        floor: z.number().optional(),
        floorCount: z.number().optional(),
        hasParking: z.boolean().default(false),
        hasGarden: z.boolean().default(false),
        hasElevator: z.boolean().default(false),
        hasFurnished: z.boolean().default(false),
        heatingType: z.string().optional(),
        buildYear: z.number().optional(),
        agentId: z.number().optional(),
        ownerId: z.number().optional(),
        features: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const data = {
        ...input,
        price: String(input.price),
        features: input.features ? JSON.stringify(input.features) : null,
        agentId: input.agentId ?? ctx.user.id,
      };
      const result = await db.insert(properties).values(data as any);
      return { success: true, id: Number((result as any).insertId) };
    }),

  update: managerQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(3).optional(),
        description: z.string().optional(),
        slug: z.string().min(3).optional(),
        status: z.enum(["ACTIVE", "PASSIVE", "POTENTIAL", "SOLD", "RENTED"]).optional(),
        type: z.enum(["APARTMENT", "HOUSE", "LAND", "COMMERCIAL", "OFFICE", "WAREHOUSE"]).optional(),
        listingType: z.enum(["SALE", "RENT"]).optional(),
        price: z.number().positive().optional(),
        currency: z.string().optional(),
        area: z.number().optional(),
        netArea: z.number().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        roomCount: z.number().optional(),
        bathroomCount: z.number().optional(),
        floor: z.number().optional(),
        floorCount: z.number().optional(),
        hasParking: z.boolean().optional(),
        hasGarden: z.boolean().optional(),
        hasElevator: z.boolean().optional(),
        hasFurnished: z.boolean().optional(),
        heatingType: z.string().optional(),
        buildYear: z.number().optional(),
        agentId: z.number().optional(),
        ownerId: z.number().optional(),
        features: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.price) updateData.price = String(data.price);
      if (data.features) updateData.features = JSON.stringify(data.features);
      await db.update(properties).set(updateData).where(eq(properties.id, id));
      return { success: true };
    }),

  delete: managerQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(properties).where(eq(properties.id, input.id));
      return { success: true };
    }),

  updateStatus: managerQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["ACTIVE", "PASSIVE", "POTENTIAL", "SOLD", "RENTED"]),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(properties)
        .set({ status: input.status })
        .where(eq(properties.id, input.id));
      return { success: true };
    }),

  addImage: authedQuery
    .input(
      z.object({
        propertyId: z.number(),
        url: z.string().url(),
        altText: z.string().optional(),
        isMain: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(propertyImages).values({
        propertyId: input.propertyId,
        url: input.url,
        altText: input.altText,
        isMain: input.isMain,
      });
      return { success: true };
    }),

  deleteImage: managerQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(propertyImages).where(eq(propertyImages.id, input.id));
      return { success: true };
    }),
});
