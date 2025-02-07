import { redirect } from "next/navigation";
import { is_data_error } from "~/_server_/data_error";
import { check_user_permission, Role } from "~/app/api/c_user";

export default async function Page() {
    const user = await check_user_permission([Role.Tech]);
    if (is_data_error(user)) redirect("/");

    return (
        <div className="flex h-dvh w-full justify-center">
            <div className="m-auto grid grid-cols-2 justify-items-center gap-10">
                <a href={"/tech/rec"}>
                    <button className="h-20 w-32 rounded-full border-4 border-sky-900">
                        Daily Record
                    </button>
                </a>
                <a href={"/tech/summary"}>
                    <button className="h-20 w-32 rounded-full border-4 border-sky-900">
                        Summary
                    </button>
                </a>
            </div>
        </div>
    );
}
