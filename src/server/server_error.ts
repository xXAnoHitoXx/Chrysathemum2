import * as Sentry from "@sentry/nextjs"
import { FireDB } from "./db_schema/fb_schema";

export type ServerError = { error: ServerMessage }

export function server_error(message: string): ServerError {
    return { error: new ServerMessage(message) };
}

export function is_server_error(t: unknown): t is ServerError {
    if (typeof t !== "object" || t == null) {
        return false;
    }
    
    if (!("error" in t)) {
        return false;
    }
    
    const error: unknown  = t.error;

    if (error == null) {
        return false;
    }

    return error instanceof ServerMessage;
}

class ServerMessage {
    message = "";

    constructor(error: string){
        this.message = error;
        if(!(new FireDB()).is_in_test_mode()){
            Sentry.captureMessage(this.message);
        } else {
            console.log();
        }
    }
}

