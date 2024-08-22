import { redirect } from "next/navigation";
import { get_current_user } from "../api/c_user";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await get_current_user();

    if (!user) {
        redirect("/");
    }

    const has_permission =
        user.publicMetadata.Role === "operator" ||
        user.publicMetadata.Role === "admin";

    if (!has_permission) {
        redirect("/");
    }

    return <>{children}</>;
}
