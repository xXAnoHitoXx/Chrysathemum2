export async function parse_response<T>(response: Response, to: (t: unknown) => T | ResponseError): Promise<T | ResponseError> {
    if(!response.ok){
        return { error: await response.text() };
    }
    return to(await response.json());
}

export async function pares_void_response(response: Response): Promise<ResponseError | null> {
    if(!response.ok){
        return { error: await response.text() };
    }
    return null;
}
