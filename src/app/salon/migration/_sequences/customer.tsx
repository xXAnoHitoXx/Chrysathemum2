import { useMutation } from "@tanstack/react-query";
import { Method } from "~/app/api/api_query";
import { z } from "zod";
import { OldCustomerEntry } from "~/server/migration/customer/components/type_def";
import { chunked } from "itertools";

export function useCustomerMigration(on_complete: () => void) {
    return useMutation({
        mutationFn: async (reporter: (report: string) => void) => {
            reporter("------- Migrating Customers -------");
            reporter("> retrieving customers from old db");
            const customers_fetch_response = await fetch(
                "/api/migration/customer",
                {
                    method: Method.GET,
                },
            );

            if (customers_fetch_response.status !== 200) {
                reporter(
                    `fetch error > ${customers_fetch_response.status.toString(10)}`,
                );
                reporter("------- Done -------");
                on_complete();
                return;
            }

            const customers = z
                .array(OldCustomerEntry)
                .safeParse(await customers_fetch_response.json());

            if (!customers.success) {
                reporter("parsing error - data be weird");
                reporter(customers.error.message);
                reporter("------- Done -------");
                on_complete();
                return;
            }

            reporter("> retrieved " + customers.data.length + " entries");

            const batches = chunked(customers.data, 100);

            let batch_number = 1;
            for (const batch of batches) {
                reporter(
                    `> migrating batch ${batch_number} - ${batch_number}/${Math.ceil(customers.data.length / 100)}`,
                );
                const migration = await fetch("/api/migration/customer", {
                    method: Method.POST,
                    body: JSON.stringify(batch),
                });
                if (migration.status !== 200) {
                    reporter("batch error > " + migration.status.toString(10));
                }
                batch_number++;
            }

            reporter("------- Done -------");
            on_complete();
        },
        mutationKey: ["customer_migration"],
    });
}
