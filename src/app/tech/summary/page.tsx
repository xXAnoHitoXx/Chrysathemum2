import { redirect } from "next/navigation";
import { require_permission, Role } from "~/app/api/c_user";
import { data_error, is_data_error } from "~/server/data_error";
import { get_bisquit } from "~/server/queries/crud/biscuits";
import { Bisquit } from "~/server/validation/bisquit";
import { is_string } from "~/server/validation/simple_type";
import { TechSummaryView } from "./_component/client_component";

export default async function Page() {
    const user = await require_permission([Role.Tech]);

    const tech_id = user?.publicMetadata.Tech_id;

    if (!is_string(tech_id)) {
        data_error(`technician ${tech_id}`, "meta data error").report();
        return <div>meta data error - tell Tinn 2 fix</div>;
    }

    const salon = await get_bisquit(Bisquit.salon_selection);

    if (is_data_error(salon)) redirect("/");

    return <TechSummaryView salon={salon} />;
}
