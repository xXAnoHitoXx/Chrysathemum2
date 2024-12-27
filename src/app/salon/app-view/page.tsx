import { currentUser } from "@clerk/nextjs/server";
import { Role } from "~/app/api/c_user";
import { AppView } from "./_components/app_view_page";

export default async function Page() {
    const user = await currentUser();
    const is_admin = user!.publicMetadata.Role === Role.Admin;
    return <AppView admin={is_admin} />;
}
