import { redirect } from "next/navigation";
import { require_permission, Role } from "~/app/api/c_user";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await require_permission([Role.Admin]).catch(() => {
        redirect("/");
    });

    return <div>{children}</div>;
}
