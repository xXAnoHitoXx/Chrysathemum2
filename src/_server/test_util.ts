import { remove } from "firebase/database";
import { ServerQuery } from "./server_query";
import { DataError } from "./data_error";

export const wipe_test_data: ServerQuery<string, void> =
    ServerQuery.create_query(async (test_name, f_db) => {
        if (!f_db.in_test_mode())
            return new DataError(`performed ${test_name} not in test_mode`);
        await remove(f_db.access([]));
    });

export const assert_test_mode: ServerQuery<string, void> =
    ServerQuery.create_query(async (test_name: string, f_db) => {
        if (!f_db.in_test_mode())
            return new DataError(`performed ${test_name} not in test_mode`);
    });
