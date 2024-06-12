import { parse_request } from "../../request_parser";
import { to_old_customer_data } from "./validation";
import { pack } from "~/server/queries/server_queries_monad";
import { unpack_response } from "../../response_parser";
import { import_customer_from_old_db, migrate_customer_data } from "~/server/queries/business/migration/customer";

export async function POST(request: Request): Promise<Response> {
    const query = pack(request).bind(parse_request(to_old_customer_data))
        .packed_bind(migrate_customer_data)
    return unpack_response(query);
}

export async function GET(): Promise<Response> {
    const query = pack(undefined).bind(import_customer_from_old_db);
    return unpack_response(query);
}
