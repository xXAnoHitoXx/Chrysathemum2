import {
    OldRecord,
    to_old_Record,
} from "~/app/api/migration/record/validation";
import {
    DataError,
    is_data_error,
    lotta_errors,
    PartialResult,
} from "~/server/data_error";
import { db_query, Query } from "../../server_queries_monad";
import { get } from "firebase/database";

export const import_records_from_old_db: Query<
    void,
    PartialResult<OldRecord[]>
> = async (_, f_db) => {
    const context = "Import Customers from Old DB";
    const data_snapshot = await db_query(
        context,
        get(f_db.old_db(["transaction", "id"])),
    );
    if (is_data_error(data_snapshot)) return data_snapshot;

    const records: OldRecord[] = [];
    const errors: DataError[] = [];

    data_snapshot.forEach((data) => {
        const record = to_old_Record(data.val(), Number(data.key));

        if (is_data_error(record)) {
            errors.push(record);
        } else {
            records.push(record);
        }
    });

    return {
        data: records,
        error: lotta_errors(context, "...", errors),
    };
};
