import { to_old_customer_data } from "./validation";
import { pack } from "~/server/queries/server_queries_monad";
import {
    import_customer_from_old_db,
    migrate_customer_data,
} from "~/server/queries/business/migration/customer";
import { parse_request, unpack_response } from "../../server_parser";
import { extract_error } from "~/server/data_error";

export async function POST(request: Request): Promise<Response> {
    const query = pack(request)
        .bind(parse_request(to_old_customer_data))
        .bind(migrate_customer_data);
    return unpack_response(query);
}

export async function GET(): Promise<Response> {
    const query = pack(undefined)
        .bind(import_customer_from_old_db)
        .bind(
            extract_error((error) => {
                error.report();
            }),
        );
    return unpack_response(query);
}
