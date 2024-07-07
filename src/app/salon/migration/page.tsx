"use client"

import { useState } from "react";
import { Method, fetch_query } from "~/app/api/api_query";
import { to_old_customer_data } from "~/app/api/migration/customer/validation";
import { to_array } from "~/server/validation/simple_type";
import { is_response_error } from "~/server/validation/validation_error";
import { ano_iter } from "~/util/anoiter/anoiter";

export default function MigrationStation() {
    const [is_loading, set_is_loading] = useState(false);

    async function migration_sequence() {
        set_is_loading(true);
        const old_customers = await fetch_query({
            url: "/api/migration/customer",
            method: Method.GET,
            to: to_array(to_old_customer_data),
            params: null,
        })

        if(is_response_error(old_customers)) { 
            console.log("failed to retrieve old customers")
            return 
        }

        const batches = ano_iter(old_customers).ichunk(20).collect();

        for (const batch_of_customers of batches){
            console.log(batch_of_customers);
            await Promise.all(batch_of_customers.map((customer) => (
                fetch_query({
                    url: "/api/migration/customer",
                    method: Method.POST,
                    params: { data: customer },
                    to: () => (null),
                })
            )));
        }
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

