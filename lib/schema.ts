import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const complaints = sqliteTable("complaints", {
  id: text("id").primaryKey(),
  caseRef: text("case_ref").notNull().unique(),
  consumerName: text("consumer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  businessName: text("business_name").notNull(),
  businessAddress: text("business_address"),
  category: text("category").notNull(),
  description: text("description").notNull(),
  incidentDate: text("incident_date"),
  amount: real("amount"),
  dateFiled: text("date_filed").notNull().default(sql`(date('now'))`),
  status: text("status").notNull().default("Submitted"),
  assignedOfficer: text("assigned_officer").default(""),
  notes: text("notes").notNull().default("[]"), // JSON array of strings
  responseSummary: text("response_summary").default(""),
});

export const priceEntries = sqliteTable("price_entries", {
  id: text("id").primaryKey(),
  product: text("product").notNull(),
  supplier: text("supplier").notNull(),
  surveyedPrice: real("surveyed_price").notNull(),
  controlledPrice: real("controlled_price").notNull(),
  lastUpdated: text("last_updated").notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull(),
});

export const pricePoints = sqliteTable("price_points", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  priceEntryId: text("price_entry_id").notNull(),
  month: text("month").notNull(),
  surveyed: real("surveyed").notNull(),
});

export const officers = sqliteTable("officers", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  // SHA-256 hex of password — adequate for a demo
  passwordHash: text("password_hash").notNull(),
});
