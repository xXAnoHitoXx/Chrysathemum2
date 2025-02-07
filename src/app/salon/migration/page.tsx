"use client";

import { useState } from "react";

export default function MigrationStation() {
    const [is_loading, _] = useState(false);

    async function migration_sequence() {
        /*
        set_is_loading(true);
        const old_customers = await fetch_query({
            url: "/api/migration/customer",
            method: Method.GET,
            to: to_array(to_old_customer_data),
            params: null,
        });

        if (is_data_error(old_customers)) {
            old_customers.log();
            return;
        }

        const batches = ano_iter(old_customers).ichunk(20).collect();

        for (const batch_of_customers of batches) {
            console.log(batch_of_customers);
            const res = await Promise.all(
                batch_of_customers.map((customer) =>
                    fetch_query({
                        url: "/api/migration/customer",
                        method: Method.POST,
                        params: { data: customer },
                        to: () => null,
                    }),
                ),
            );

            for (let i = 0; i < res.length; i++) {
                const result = res[i];
                if (is_data_error(result)) {
                    result.log();
                    result.report();
                }
            }
        }
        */
    }

    return (
        <div>
            <div className="flex h-fit w-full flex-wrap justify-center gap-2 p-4">
                <button
                    onClick={migration_sequence}
                    disabled={is_loading}
                    className="h-20 w-32 rounded-full border-2 border-sky-400"
                >
                    Initiate Migration Sequence
                </button>
            </div>
        </div>
    );
}
