import { redirect } from "next/navigation";
import { get_current_user } from "../api/c_user";
import SalonSelect from "./salon_select";

export default async function RetryRedirect() {
    let user = await get_current_user();

    while (user == null) {
        user = await get_current_user();
    }

    if (user.publicMetadata.Role === "tech") {
        redirect("/tech");
    }

    const is_manager =
        user.publicMetadata.Role === "admin" ||
        user.publicMetadata.Role === "operator";
    return <SalonSelect is_admin={is_manager} />;
}
