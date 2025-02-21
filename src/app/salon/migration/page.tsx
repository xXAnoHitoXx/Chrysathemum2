"use client";

import { useState } from "react";
import { useCustomerMigration } from "./_sequences/customer";

export default function MigrationStation() {
    const [is_loading, set_loading] = useState(false);
    const [messages, set_messages] = useState<string[]>([]);
    const customer_migration = useCustomerMigration(() => set_loading(false));

    function reporter(report: string) {
        set_messages((prev) => [...prev, report]);
    }

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex h-fit w-full gap-2 border-b-2 border-b-sky-900 p-2">
                <button
                    onClick={async () => {
                        set_loading(true);
                        customer_migration.mutate(reporter);
                    }}
                    disabled={is_loading}
                    className="h-20 w-32 rounded-full border-2 border-sky-400"
                >
                    Customer Migration
                </button>
            </div>
            <div className="w-full flex-1 overflow-y-scroll">
                {messages.map((message) => 
                    <div className="w-full h-fit">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
