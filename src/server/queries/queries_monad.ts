import * as Sentry from "@sentry/nextjs"
import { FireDB } from "../db_schema/fb_schema";
import { remove } from "firebase/database";

export class QueryError {
    message = "";

    constructor(error: string){
        this.message = error;
        Sentry.captureMessage(this.message);
    }
}

export type Query<T, U> = (t: T, fire_db: FireDB) => Promise<U | QueryError>;

export interface iServerQueryData<T> {
    unpack(): Promise<T | QueryError>;
    bind<U>(query: Query<T, U>): iServerQueryData<U>;
    clear_test_data(): Promise<QueryError | null>;
}

export function is_successful_query<T>(result: T | QueryError): result is T {
    return !(result instanceof QueryError);
}

export function pack<T>(data: T): iServerQueryData<T> {
    return new SimpleQueryData(data, new FireDB(), false);
}

export function pack_test<T>(data: T, test_name: string): iServerQueryData<T> {
    return new SimpleQueryData(data, new FireDB(test_name), true);
}

export function packed_query<T, U, V>(query: Query<T, U>, packer: (t: T, u: U) => V | QueryError): Query<T, V> {
    return async (t: T, fire_db: FireDB) => {
        const u = await query(t, fire_db);
        if (u instanceof QueryError) {
            return u;
        }
        return packer(t, u);
    }
}

export function retain_input<T>(query: Query<T, null>): Query<T, T> {
    return async (t: T, fire_db: FireDB) => {
        const err: QueryError | null = await query(t, fire_db);
        if (err instanceof QueryError){
            return err;
        }
        return t;
    }
}

class SimpleQueryData<T> implements iServerQueryData<T> {
    private data: T | QueryError; 
    private fire_db: FireDB;
    private is_test: boolean;

    constructor(data: T | QueryError, fire_db: FireDB, is_test: boolean) {
        this.data = data;
        this.fire_db = fire_db;
        this.is_test = is_test;
    }

    async unpack(): Promise<T | QueryError> {
        return this.data;
    }

    bind<U>(query: Query<T, U>): iServerQueryData<U> {
        return new ServerQueryData<T, U>(this, query, this.fire_db, this.is_test);
    }

    async clear_test_data(): Promise<QueryError | null> {
        if (!this.is_test) {
            const message = "Server Query is not in test mode";
            console.log(message);
            return new QueryError(message);
        }
        
        if (!this.fire_db.is_in_test_mode()) {
            const message = "Node ENV is not in test mode";
            console.log(message);
            return new QueryError(message);
        }

        await remove(this.fire_db.root());
        return null;
    }
}

class ServerQueryData<T, U> implements iServerQueryData<U> {
    private data: iServerQueryData<T>; 
    private query: Query<T, U>;
    private fire_db: FireDB;
    private is_test: boolean;

    constructor(data: iServerQueryData<T>, query: Query<T, U>, fire_db: FireDB, is_test: boolean) {
        this.data = data;
        this.query = query;
        this.fire_db = fire_db;
        this.is_test = is_test;
    }

    async unpack(): Promise<U | QueryError> {
        const data: T | QueryError = await this.data.unpack();

        if (data instanceof QueryError) {
            return data;
        }

        return await this.query(data, this.fire_db);
    }

    bind<V>(query: Query<U, V>): iServerQueryData<V> {
        return new ServerQueryData<U, V>(this, query, this.fire_db, this.is_test);
    }

    async clear_test_data(): Promise<QueryError | null> {
        return await this.data.clear_test_data();
    }
}
