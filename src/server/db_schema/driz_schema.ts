/*
import 'server-only';
// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration
import {
    pgTableCreator,
    text,
    integer,
    boolean,
    index,
    serial,
} from "drizzle-orm/pg-core";


export const createTable = pgTableCreator((name) => `chrysanthemum-2_${name}`);

export const customers = createTable(
  "customers",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    phone_number: text("phone_number").notNull(),
  },
  (table) => {
      return {
          name_index: index("name_index").on(table.name),
          phone_index: index("phone_index").on(table.phone_number),
      };
  }
);

export const locations = createTable(
  "locations",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    address: text("address").notNull(),
  }
);

export const technicians = createTable(
  "technicians",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    colour: text("colour").notNull(),
  }
);

export const attendance = createTable(
    "attendance",
    {
        id: serial("id").primaryKey(),
        date: text("date").notNull(),
        tech_id: integer("tech_id").references(() => technicians.id).notNull(),
        location_id: text("location_id").references(() => locations.id).notNull(),
    },
    (table) => {
        return {
          date_loc_tech_index: index("date_loc_tech_index").on(table.date, table.location_id, table.tech_id),
          date_tech_index: index("date_tech_index").on(table.date, table.tech_id),
        };
    }
);

export const transactions = createTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    attendance: integer("attendance").references(() => attendance.id).notNull(),
    customer_id: integer("customer_id").references(() => customers.id).notNull(),
    description: text("description").notNull().default(""),
    amount: integer("amount").notNull().default(0),
    tip: integer("tip").notNull().default(0),
    time: integer("time").notNull().default(0),
    duration: integer("duration").notNull().default(0),
    closed: boolean("closed").notNull().default(false),
  },
  (table) => {
      return {
          customer_index: index("customer_index").on(table.customer_id),
          attendance_index: index("attendance").on(table.attendance),
      };
  }
);

export const web_users = createTable(
  "web_users",
  {
    id: text("id").primaryKey(),
    customer_id: integer("customer_id").references(() => customers.id).notNull().unique(),
  }
);

export const web_technicians = createTable(
  "web_technicians",
  {
    id: text("id").primaryKey(),
    tech_id: integer("tech_id").references(() => technicians.id).notNull().unique(),
  }
);

export const fb_techs = createTable(
  "fb_tenicians",
  {
    id: text("id").primaryKey(),
    tech_id: integer("tech_id").references(() => technicians.id).notNull(),
  }
);

export const fb_customers = createTable(
  "fb_customers",
  {
    id: text("id").primaryKey(),
    customer_id: integer("customer_id").references(() => customers.id).notNull(),
  }
);
*/
