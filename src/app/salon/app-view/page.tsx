import { currentUser } from "@clerk/nextjs/server";
import { Role } from "~/app/api/c_user";
import { AppView } from "./_components/app_view_page";
import { is_data_error } from "~/server/data_error";
import { redirect } from "next/navigation";
import { Bisquit, get_bisquit } from "~/server/bisquit/bisquit";

export default async function Page() {
    const user = await currentUser();
    const is_admin = user!.publicMetadata.Role === Role.Admin;

    const salon = await get_bisquit(Bisquit.enum.salon_selection);
    if (is_data_error(salon)) redirect("/");

    return <AppView admin={is_admin} salon={salon} />;
}
