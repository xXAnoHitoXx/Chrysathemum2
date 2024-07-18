import { data_error, DataError } from "~/server/data_error";

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
