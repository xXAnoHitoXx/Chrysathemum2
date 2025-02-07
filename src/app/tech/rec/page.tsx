import { TechDataDisplay } from "./_components/client_component";
import { check_user_permission, Role } from "~/app/api/c_user";
import { z } from "zod";
import { redirect } from "next/navigation";
import { DataError, is_data_error } from "~/server/data_error";
import { retrieve_technician_entry } from "~/server/technician/components/technician_entry";
import { FireDB } from "~/server/fire_db";

export default async function Page() {
    const user = await check_user_permission([Role.Tech]);
    if (is_data_error(user)) {
        redirect("/");
    }

    const tech_id = z.string().safeParse(user?.publicMetadata.Tech_id);

    if (!tech_id.success) {
        new DataError(`technician ${tech_id} metaData error`).report();
        return <div>meta data error - tell Tinn 2 fix</div>;
    }

    const technician = await retrieve_technician_entry.call(
        { tech_id: tech_id.data },
        FireDB.active(),
    );

    if (is_data_error(technician)) {
        technician.report();
        return <div>tech entry error - tell Tinn 2 fix</div>;
    }

    return (
        <TechDataDisplay tech={technician}>
            <a href={"/tech/nav"}>
                <button className="h-full w-32 rounded-full border-4 border-sky-900">
                    Return
                </button>
            </a>
        </TechDataDisplay>
    );
}
