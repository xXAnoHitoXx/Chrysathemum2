import { require_permission, Role } from "~/app/api/c_user";

export default async function Page() {
    require_permission([Role.Tech]);

    return (
        <div className="flex h-dvh w-full justify-center">
            <div className="m-auto grid grid-cols-2 justify-items-center gap-10">
                <a href={"/tech/rec"}>
                <button
                    className="h-20 w-32 rounded-full border-4 border-sky-900"
                >
                    Daily Record 
                </button>
                </a>
                <button
                    className="h-20 w-32 rounded-full border-4 border-sky-900"
                >
                    Summary
                </button>
            </div>
        </div>
    );
}
