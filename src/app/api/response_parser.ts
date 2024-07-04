export type ResponseError = {
    error: string;
}

export async function parse_response<T>(response: Response, to: (t: unknown) => T | ResponseError): Promise<T | ResponseError> {
    if(!response.ok){
        return { error: await response.text() };
    }
    return to(await response.json());
}
