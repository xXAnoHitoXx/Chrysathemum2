import { ResponseError } from "~/app/api/response_parser";
import { is_object, is_string } from "./simple_type";

export type TypeConversionError = ResponseError;

export const is_type_conversion_error = is_response_error;

export function is_response_error(t: unknown): t is ResponseError {
    if (!is_object(t)) {
        return false;
    }
    
    if (!("error" in t)) {
        return false;
    }
    
    return is_string(t.error);
}
