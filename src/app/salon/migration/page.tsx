"use client"

import { useState } from "react";
import type { Old_Customer_Data } from "~/server/queries/migration/customer";
import { res_into_Old_Customer_Data } from "~/server/validation/migration/customer/customer_validation";
import { TypeConversionError } from "~/server/validation/validation_error";
import { ano_iter } from "~/util/anoiter/anoiter";
import type { AnoIter } from "~/util/anoiter/anoiter";

export default function MigrationStation() {
    const [is_loading, set_is_loading] = useState(false);

    async function migration_sequence() {
        set_is_loading(true);
        const old_customers: AnoIter<Old_Customer_Data> = 
            ano_iter(
                await res_into_Old_Customer_Data(
                    await fetch(new Request(
                        "/api/migration/customer", {
                            method: "GET"
                        }
                    )
                ))
            ) .imap((data) => ( (data instanceof TypeConversionError)? null : data ))
            .icompact<Old_Customer_Data>();

        for (const customers of old_customers.ichunk(20).collect()){
            console.log(customers);
            await Promise.all(customers.map((customer) => (
                fetch(
                    "/api/migration/customer", {
                        method: "POST",
                        body: JSON.stringify(customer),
                    }
                )
            )));
        }

        console.log("Finished Migrating Customers");
    }

    return(
        <div>
            <div className="flex flex-wrap w-full h-fit p-4 gap-2 justify-center">
                <button onClick={ migration_sequence } disabled={is_loading} className="border-2 border-sky-400 rounded-full w-32 h-20">
                    Initiate Migration Sequence
                </button>
            </div>
        </div>
    );
}

