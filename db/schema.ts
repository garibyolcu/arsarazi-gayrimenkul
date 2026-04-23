import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  decimal,
  boolean,
  json,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/* ================================================================
   ENUMS
   ================================================================ */

export const propertyStatusEnum = mysqlEnum("property_status", [
  "ACTIVE",
  "PASSIVE",
  "POTENTIAL",
  "SOLD",
  "RENTED",
]);

export const propertyTypeEnum = mysqlEnum("property_type", [
  "APARTMENT",
  "HOUSE",
  "LAND",
  "COMMERCIAL",
  "OFFICE",
  "WAREHOUSE",
]);

export const listingTypeEnum = mysqlEnum("listing_type", ["SALE", "RENT"]);

export const transactionTypeEnum = mysqlEnum("transaction_type", [
  "SALE",
  "RENT",
  "LEASE",
  "VALUATION",
]);

export const transactionStatusEnum = mysqlEnum("transaction_status", [
  "LEAD",
  "NEGOTIATION",
  "OFFER",
  "CONTRACT",
  "CLOSED",
  "CANCELLED",
]);

export const customerTypeEnum = mysqlEnum("customer_type", [
  "BUYER",
  "SELLER",
  "RENTER",
  "LANDLORD",
  "INVESTOR",
]);

export const documentTypeEnum = mysqlEnum("document_type", [
  "TITLE_DEED",
  "POWER_OF_ATTORNEY",
  "CONTRACT",
  "ID_COPY",
  "FLOOR_PLAN",
  "VALUATION_REPORT",
  "OTHER",
]);

export const leadStatusEnum = mysqlEnum("lead_status", [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CONVERTED",
  "LOST",
]);

export const userRoleEnum = mysqlEnum("user_role", [
  "ADMIN",
  "MANAGER",
  "AGENT",
  "VIEWER",
]);

export const customerSourceEnum = mysqlEnum("customer_source", [
  "REFERRAL",
  "WEBSITE",
  "SOCIAL_MEDIA",
  "WALK_IN",
  "OTHER",
]);

/* ================================================================
   USERS (Sistem Kullanıcıları — Danışmanlar)
   ================================================================ */

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("union_id", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum.default("AGENT").notNull(),
  phone: varchar("phone", { length: 50 }),
  avatar: text("avatar"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("last_sign_in_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/* ================================================================
   CUSTOMERS (Müşteri & Yatırımcı)
   ================================================================ */

export const customers = mysqlTable("customers", {
  id: serial("id").primaryKey(),
  type: customerTypeEnum.default("BUYER").notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  tcNumber: text("tc_number"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  budgetMin: decimal("budget_min", { precision: 19, scale: 4 }),
  budgetMax: decimal("budget_max", { precision: 19, scale: 4 }),
  budgetCurrency: varchar("budget_currency", { length: 10 }).default("TRY"),
  preferences: json("preferences"),
  source: customerSourceEnum.default("WALK_IN").notNull(),
  rating: int("rating"),
  assignedAgentId: bigint("assigned_agent_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/* ================================================================
   PROPERTIES (Portföy / İlan)
   ================================================================ */

export const properties = mysqlTable(
  "properties",
  {
    id: serial("id").primaryKey(),
    status: propertyStatusEnum.default("ACTIVE").notNull(),
    type: propertyTypeEnum.default("APARTMENT").notNull(),
    listingType: listingTypeEnum.default("SALE").notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 600 }).notNull().unique(),
    price: decimal("price", { precision: 19, scale: 4 }).notNull(),
    currency: varchar("currency", { length: 10 }).default("TRY").notNull(),
    pricePerSqm: decimal("price_per_sqm", { precision: 19, scale: 4 }),
    area: int("area"),
    netArea: int("net_area"),
    floorCount: int("floor_count"),
    floor: int("floor"),
    roomCount: int("room_count"),
    bathroomCount: int("bathroom_count"),
    hasParking: boolean("has_parking").default(false),
    hasGarden: boolean("has_garden").default(false),
    hasElevator: boolean("has_elevator").default(false),
    hasFurnished: boolean("has_furnished").default(false),
    heatingType: varchar("heating_type", { length: 100 }),
    buildYear: int("build_year"),
    city: varchar("city", { length: 100 }),
    district: varchar("district", { length: 100 }),
    neighborhood: varchar("neighborhood", { length: 100 }),
    street: varchar("street", { length: 255 }),
    fullAddress: text("full_address"),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    features: json("features"),
    views: int("views").default(0),
    agentId: bigint("agent_id", { mode: "number", unsigned: true }),
    ownerId: bigint("owner_id", { mode: "number", unsigned: true }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    statusIdx: index("property_status_idx").on(table.status),
    typeIdx: index("property_type_idx").on(table.type),
    cityIdx: index("property_city_idx").on(table.city),
    agentIdx: index("property_agent_idx").on(table.agentId),
    listingTypeIdx: index("property_listing_type_idx").on(table.listingType),
    priceIdx: index("property_price_idx").on(table.price),
  })
);

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

/* ================================================================
   PROPERTY IMAGES
   ================================================================ */

export const propertyImages = mysqlTable(
  "property_images",
  {
    id: serial("id").primaryKey(),
    propertyId: bigint("property_id", { mode: "number", unsigned: true })
      .notNull(),
    url: text("url").notNull(),
    altText: varchar("alt_text", { length: 255 }),
    order: int("order").default(0),
    isMain: boolean("is_main").default(false),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  },
  (table) => ({
    propertyIdx: index("img_property_idx").on(table.propertyId),
  })
);

export type PropertyImage = typeof propertyImages.$inferSelect;
export type InsertPropertyImage = typeof propertyImages.$inferInsert;

/* ================================================================
   TRANSACTIONS (İşlem Takibi)
   ================================================================ */

export const transactions = mysqlTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    type: transactionTypeEnum.default("SALE").notNull(),
    status: transactionStatusEnum.default("LEAD").notNull(),
    propertyId: bigint("property_id", { mode: "number", unsigned: true }),
    buyerId: bigint("buyer_id", { mode: "number", unsigned: true }),
    sellerId: bigint("seller_id", { mode: "number", unsigned: true }),
    renterId: bigint("renter_id", { mode: "number", unsigned: true }),
    landlordId: bigint("landlord_id", { mode: "number", unsigned: true }),
    agentId: bigint("agent_id", { mode: "number", unsigned: true }),
    agreedPrice: decimal("agreed_price", { precision: 19, scale: 4 }),
    commission: decimal("commission", { precision: 19, scale: 4 }),
    commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
    contractDate: timestamp("contract_date"),
    closingDate: timestamp("closing_date"),
    handoverDate: timestamp("handover_date"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    statusIdx: index("transaction_status_idx").on(table.status),
    propertyIdx: index("transaction_property_idx").on(table.propertyId),
    agentIdx: index("transaction_agent_idx").on(table.agentId),
  })
);

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/* ================================================================
   TRANSACTION NOTES
   ================================================================ */

export const transactionNotes = mysqlTable(
  "transaction_notes",
  {
    id: serial("id").primaryKey(),
    transactionId: bigint("transaction_id", { mode: "number", unsigned: true })
      .notNull(),
    content: text("content").notNull(),
    authorId: bigint("author_id", { mode: "number", unsigned: true }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    transactionIdx: index("note_transaction_idx").on(table.transactionId),
  })
);

export type TransactionNote = typeof transactionNotes.$inferSelect;
export type InsertTransactionNote = typeof transactionNotes.$inferInsert;

/* ================================================================
   TRANSACTION EVENTS (Zaman Çizelgesi)
   ================================================================ */

export const transactionEvents = mysqlTable(
  "transaction_events",
  {
    id: serial("id").primaryKey(),
    transactionId: bigint("transaction_id", { mode: "number", unsigned: true })
      .notNull(),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    description: text("description"),
    eventDate: timestamp("event_date").defaultNow().notNull(),
    createdById: bigint("created_by_id", { mode: "number", unsigned: true }),
  },
  (table) => ({
    transactionIdx: index("event_transaction_idx").on(table.transactionId),
  })
);

export type TransactionEvent = typeof transactionEvents.$inferSelect;
export type InsertTransactionEvent = typeof transactionEvents.$inferInsert;

/* ================================================================
   CUSTOMER NOTES
   ================================================================ */

export const customerNotes = mysqlTable(
  "customer_notes",
  {
    id: serial("id").primaryKey(),
    customerId: bigint("customer_id", { mode: "number", unsigned: true })
      .notNull(),
    content: text("content").notNull(),
    authorId: bigint("author_id", { mode: "number", unsigned: true }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    customerIdx: index("note_customer_idx").on(table.customerId),
  })
);

export type CustomerNote = typeof customerNotes.$inferSelect;
export type InsertCustomerNote = typeof customerNotes.$inferInsert;

/* ================================================================
   DOCUMENTS (Belge Arşivi)
   ================================================================ */

export const documents = mysqlTable(
  "documents",
  {
    id: serial("id").primaryKey(),
    type: documentTypeEnum.default("OTHER").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    fileUrl: text("file_url").notNull(),
    fileSize: int("file_size"),
    mimeType: varchar("mime_type", { length: 100 }),
    isVerified: boolean("is_verified").default(false),
    verifiedAt: timestamp("verified_at"),
    verifiedById: bigint("verified_by_id", { mode: "number", unsigned: true }),
    tags: json("tags"),
    propertyId: bigint("property_id", { mode: "number", unsigned: true }),
    customerId: bigint("customer_id", { mode: "number", unsigned: true }),
    transactionId: bigint("transaction_id", {
      mode: "number",
      unsigned: true,
    }),
    uploadedById: bigint("uploaded_by_id", { mode: "number", unsigned: true }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    propertyIdx: index("doc_property_idx").on(table.propertyId),
    customerIdx: index("doc_customer_idx").on(table.customerId),
    transactionIdx: index("doc_transaction_idx").on(table.transactionId),
  })
);

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/* ================================================================
   LEADS (Potansiyel Müşteriler)
   ================================================================ */

export const leads = mysqlTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    source: varchar("source", { length: 100 }).default("WEBSITE"),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    email: varchar("email", { length: 320 }),
    message: text("message"),
    status: leadStatusEnum.default("NEW").notNull(),
    interestedIn: json("interested_in"),
    budget: decimal("budget", { precision: 19, scale: 4 }),
    assignedAgentId: bigint("assigned_agent_id", {
      mode: "number",
      unsigned: true,
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    statusIdx: index("lead_status_idx").on(table.status),
    agentIdx: index("lead_agent_idx").on(table.assignedAgentId),
  })
);

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/* ================================================================
   AUDIT LOG
   ================================================================ */

export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true }),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: bigint("entity_id", { mode: "number", unsigned: true }),
    changes: json("changes"),
    ipAddress: varchar("ip_address", { length: 100 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("audit_user_idx").on(table.userId),
    entityIdx: index("audit_entity_idx").on(table.entityType, table.entityId),
    createdIdx: index("audit_created_idx").on(table.createdAt),
  })
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/* ================================================================
   RELATIONS
   ================================================================ */

export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  transactions: many(transactions),
  customers: many(customers),
  documents: many(documents),
  leads: many(leads),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  assignedAgent: one(users, {
    fields: [customers.assignedAgentId],
    references: [users.id],
  }),
  transactionsBuyer: many(transactions, { relationName: "buyer" }),
  transactionsSeller: many(transactions, { relationName: "seller" }),
  documents: many(documents),
  notes: many(customerNotes),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  agent: one(users, {
    fields: [properties.agentId],
    references: [users.id],
  }),
  owner: one(customers, {
    fields: [properties.ownerId],
    references: [customers.id],
  }),
  images: many(propertyImages),
  documents: many(documents),
  transactions: many(transactions),
}));

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, {
    fields: [propertyImages.propertyId],
    references: [properties.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  property: one(properties, {
    fields: [transactions.propertyId],
    references: [properties.id],
  }),
  buyer: one(customers, {
    fields: [transactions.buyerId],
    references: [customers.id],
    relationName: "buyer",
  }),
  seller: one(customers, {
    fields: [transactions.sellerId],
    references: [customers.id],
    relationName: "seller",
  }),
  renter: one(customers, {
    fields: [transactions.renterId],
    references: [customers.id],
  }),
  landlord: one(customers, {
    fields: [transactions.landlordId],
    references: [customers.id],
  }),
  agent: one(users, {
    fields: [transactions.agentId],
    references: [users.id],
  }),
  notes: many(transactionNotes),
  events: many(transactionEvents),
  documents: many(documents),
}));

export const transactionNotesRelations = relations(transactionNotes, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionNotes.transactionId],
    references: [transactions.id],
  }),
  author: one(users, {
    fields: [transactionNotes.authorId],
    references: [users.id],
  }),
}));

export const transactionEventsRelations = relations(transactionEvents, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionEvents.transactionId],
    references: [transactions.id],
  }),
  createdBy: one(users, {
    fields: [transactionEvents.createdById],
    references: [users.id],
  }),
}));

export const customerNotesRelations = relations(customerNotes, ({ one }) => ({
  customer: one(customers, {
    fields: [customerNotes.customerId],
    references: [customers.id],
  }),
  author: one(users, {
    fields: [customerNotes.authorId],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  property: one(properties, {
    fields: [documents.propertyId],
    references: [properties.id],
  }),
  customer: one(customers, {
    fields: [documents.customerId],
    references: [customers.id],
  }),
  transaction: one(transactions, {
    fields: [documents.transactionId],
    references: [transactions.id],
  }),
  uploadedBy: one(users, {
    fields: [documents.uploadedById],
    references: [users.id],
  }),
  verifiedBy: one(users, {
    fields: [documents.verifiedById],
    references: [users.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  assignedAgent: one(users, {
    fields: [leads.assignedAgentId],
    references: [users.id],
  }),
}));
