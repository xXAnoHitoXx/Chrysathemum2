import { redirect } from "next/navigation";
import SalonSelect from "./salon_select";
import { currentUser } from "@clerk/nextjs/server";

export default async function RetryRedirect() {
    let user = await currentUser();

    while (user == null) {
        user = await currentUser();
    }

    if (user.publicMetadata.Role === "tech") {
        redirect("/tech");
    }

    const is_manager =
        user.publicMetadata.Role === "admin" ||
        user.publicMetadata.Role === "operator";
    return <SalonSelect is_admin={is_manager} />;
}
