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


/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
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

export const technicians = createTable(
  "technicians",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    colour: text("colour").notNull(),
    active_location: text("active_location").notNull().default(""),
  }
);

export const transactions = createTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    customer_id: integer("customer_id").references(() => customers.id).notNull(),
    tech_id: integer("tech_id").references(() => technicians.id).notNull(),
    description: text("description").notNull().default(""),
    amount: integer("amount").notNull().default(0),
    tip: integer("tip").notNull().default(0),
    date: integer("date").notNull().default(0),
    time: integer("time").notNull().default(0),
    duration: integer("duration").notNull().default(0),
    closed: boolean("closed").notNull().default(false),
  },
  (table) => {
      return {
          customer_index: index("customer_index").on(table.customer_id),
          date_index: index("date_index").on(table.date),
      };
  }
);

/**
 *  convert clerk user id string to the users table's id integer
 */
export const web_users = createTable(
  "web_users",
  {
    id: text("id").primaryKey(),
    customer_id: integer("customer_id").references(() => customers.id).notNull().unique(),
  }
);

/**
 *  convert clerk user id string to the technicians table's id integer
 */
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
