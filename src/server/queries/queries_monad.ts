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

export class ServerQueryData<T> {
    private data: T | QueryError; 
    private fire_db: FireDB;
    private is_test: boolean;

    constructor(data: T | QueryError, fire_db: FireDB, is_test: boolean) {
        this.data = data;
        this.fire_db = fire_db;
        this.is_test = is_test;
    }

    unpack(): T | QueryError {
        return this.data;
    }

    async bind<U>(query: Query<T, U>): Promise<ServerQueryData<U>> {
        if (this.data instanceof QueryError) {
            return new ServerQueryData<U>(this.data, this.fire_db, this.is_test);
        }

        return new ServerQueryData(await query(this.data, this.fire_db), this.fire_db, this.is_test);
    }

    clear_test_data(): QueryError | null {
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

        remove(this.fire_db.root());
        return null;
    }
}
    
export function pack<T>(data: T): ServerQueryData<T> {
    return new ServerQueryData(data, new FireDB(), false);
}

export function pack_test<T>(data: T, test_name: string): ServerQueryData<T> {
    return new ServerQueryData(data, new FireDB(test_name), true);
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

export function retain_input_query<T>(query: Query<T, null>): Query<T, T> {
    return async (t: T, fire_db: FireDB) => {
        const err: QueryError | null = await query(t, fire_db);
        if (err instanceof QueryError){
            return err;
        }
        return t;
    }
}
