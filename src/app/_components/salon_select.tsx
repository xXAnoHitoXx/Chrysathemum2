"use client";

import { Method } from "../api/api_query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bisquit } from "~/server/bisquit/type_def";

export default function SalonSelect({ next_page }: { next_page: string }) {
    const router = useRouter();
    const [is_loading, set_loading] = useState(false);

    const on_click = (salon: string): (() => Promise<void>) => {
        return async () => {
            if (is_loading) return;
            set_loading(true);

            await fetch("/api/bisquit", {
                method: Method.POST,
                body: JSON.stringify({
                    name: Bisquit.enum.salon_selection,
                    value: salon,
                }),
            });

            router.push(next_page);
            router.refresh();
        };
    };

    return (
        <div className="flex h-dvh w-full justify-center">
            <div className="m-auto grid grid-cols-2 justify-items-center gap-10">
                <button
                    onClick={on_click("5CBL")}
                    className="h-20 w-32 rounded-full border-4 border-sky-900"
                >
                    5 Cumberland
                </button>
                <button
                    onClick={on_click("SCVL")}
                    className="h-20 w-32 rounded-full border-4 border-sky-900"
                >
                    1624 Sackville
                </button>
            </div>
        </div>
    );
}
