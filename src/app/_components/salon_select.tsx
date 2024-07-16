"use client"

import { Bisquit } from "~/server/validation/bisquit";
import { fetch_query, Method } from "../api/api_query";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SalonSelect({ is_admin }: { is_admin: boolean }) {
    const next_page : string = (is_admin) ? "/salon/app-view" : "/booking";
    const router = useRouter();
    const [is_loading, set_loading] = useState(false);

    const on_click = (salon: string): ()=>Promise<void> => {
        return async ()=> {
            if(is_loading) return;
            set_loading(true);

            await fetch_query({
                url: "/api/bisquit",
                method: Method.POST,
                params: { data: { name: Bisquit.salon_selection, value: salon } },
                to: ()=>{},
            });

            router.push(next_page);
        }
    }

    return(
        <div className="flex w-full h-dvh justify-center">
            <div className="grid grid-cols-1 m-auto justify-items-center">
                <button onClick={on_click("5CBL")} className="w-32 h-20 border-4 border-sky-500 rounded-full">
                    5 Cumberland
                </button>
            </div>
        </div>
    );
}
