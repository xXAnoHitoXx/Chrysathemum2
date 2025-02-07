import { redirect } from "next/navigation";
import { check_user_permission, Role } from "~/app/api/c_user";
import { DataError, is_data_error } from "~/server/data_error";
import { TechSummaryView } from "./_component/client_component";
import { Bisquit, get_bisquit } from "~/server/bisquit/bisquit";
import { z } from "zod";

export default async function Page() {
    const user = await check_user_permission([Role.Tech]);
    if (is_data_error(user)) redirect("/");

    const tech_id = z.string().safeParse(user?.publicMetadata.Tech_id);

    if (!tech_id.success) {
        new DataError(`technician ${tech_id.data} meta data error`).report();
        return <div>meta data error - tell Tinn 2 fix</div>;
    }

    const salon = await get_bisquit(Bisquit.enum.salon_selection);

    if (is_data_error(salon)) redirect("/");

    return <TechSummaryView salon={salon} />;
}
