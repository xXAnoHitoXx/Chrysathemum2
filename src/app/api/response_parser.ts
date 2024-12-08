import { data_error, DataError, is_data_error } from "~/server/data_error";

export function handle_react_query_response<T>(
    to: (t: unknown) => T | DataError,
    handler: (t: T) => void,
    error_handler: (e: DataError) => void = () => {},
): (response: Response) => Promise<void> {
    return async (response) => {
        if (!response.ok) {
            const error = data_error(
                "Parsing Server Response",
                "encountered error on server\n".concat(await response.text()),
            );
            error.log();
            error.report();
            error_handler(error);
        } else {
            const data = to(await response.json());
            if (is_data_error(data)) {
                data.log();
                data.report();
                error_handler(data);
            } else {
                handler(data);
            }
        }
    };
}

export async function parse_response<T>(
    response: Response,
    to: (t: unknown) => T | DataError,
): Promise<T | DataError> {
    if (!response.ok) {
        return data_error(
            "Parsing Server Response",
            "encountered error on server\n".concat(await response.text()),
        );
    }
    return to(await response.json());
}
