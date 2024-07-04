import * as Sentry from "@sentry/nextjs"
import { FireDB } from "./db_schema/fb_schema";
import { ResponseError } from "~/app/api/response_parser";
import { is_response_error } from "./validation/validation_error";

export type ServerError = ResponseError;

export function server_error(message: string): ServerError {
    if(!(new FireDB()).is_in_test_mode()){
        Sentry.captureMessage(message);
    } else {
        console.log(message);
    }
    return { error: message };
}

export const is_server_error = is_response_error;
