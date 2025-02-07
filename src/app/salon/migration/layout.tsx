import { redirect } from "next/navigation";
import {  check_user_permission, Role } from "~/app/api/c_user";
import { is_data_error } from "~/server/data_error";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let user = await check_user_permission([Role.Admin]);

    if (is_data_error(user)) {
        redirect("/")
    }

    return <div>{children}</div>;
}
