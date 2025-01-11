import { currentUser } from "@clerk/nextjs/server";
import { data_error, is_data_error } from "~/server/data_error";
import { is_string } from "~/server/validation/simple_type";
import { TechDataDisplay } from "./_components/client_component";
import { retrieve_technician_entry } from "~/server/queries/crud/technician/technician_entry";
import { pack } from "~/server/queries/server_queries_monad";

export default async function Page() {
    const user = await currentUser();

    const tech_id = user?.publicMetadata.Tech_id;

    if (!is_string(tech_id)) {
        data_error(`technician ${tech_id}`, "meta data error").report();
        return <div>meta data error - tell Tinn 2 fix</div>;
    }

    const technician = await pack({ id: tech_id })
        .bind(retrieve_technician_entry)
        .unpack();

    if (is_data_error(technician)) {
        technician.report();
        return <div>tech entry error - tell Tinn 2 fix</div>;
    }

    return <TechDataDisplay tech={technician} />;
}
