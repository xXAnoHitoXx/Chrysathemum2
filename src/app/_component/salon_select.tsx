"use client"

import { Bisquit } from "~/server/validation/bisquit";
import { fetch_query, Method } from "../api/api_query";
import { redirect } from "next/navigation";
import { useState } from "react";

export default function SalonSelect({ is_admin }: { is_admin: boolean }) {
    const next_page : string = (is_admin) ? "/salon" : "/booking";
    const [is_loading, set_loading] = useState(false);

    const on_click = (salon: string): ()=>Promise<void> => {
        return async ()=> {
            if(is_loading) return;
            set_loading(true);

            const data: Bisquit = {
                name: "salon_selection",
                data: salon,
            }

            await fetch_query({
                url: "/api/bisquit",
                method: Method.POST,
                params: { data: data },
                to: ()=>{},
            });

            redirect(next_page);
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
