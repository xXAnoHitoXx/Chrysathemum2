import * as Sentry from "@sentry/nextjs"
import { fb_root } from "../db_schema/fb_schema";

export class Error {
    message = "";

    constructor(error: string){
        this.message = error;
        Sentry.captureMessage(this.message);
    }
}

export class ServerQueryData<T> {
    data: T | Error; 
    fb_root: string;

    constructor(data: T | Error, fb_root: string) {
        this.data = data;
        this.fb_root = fb_root;
    }

    unpack(): T | Error {
        return this.data;
    }

    bind<U>(query: (t: T, fb_root: string) => (U | Error)): ServerQueryData<U> {
        if (this.data instanceof Error) {
            return new ServerQueryData<U>(this.data, this.fb_root);
        }

        return new ServerQueryData(query(this.data, this.fb_root), this.fb_root);
    }
}
    
export function pack<T>(data: T): ServerQueryData<T> {
    return new ServerQueryData(data, fb_root());
}

export function pack_test<T>(data: T, redirect: string): ServerQueryData<T> {
    return new ServerQueryData(data, fb_root(redirect));
}
