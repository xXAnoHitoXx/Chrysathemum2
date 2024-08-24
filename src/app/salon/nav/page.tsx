import { redirect } from "next/navigation";
import { get_current_user } from "~/app/api/c_user";

export default async function Nav() {
    const user = await get_current_user();

    if (!user) {
        redirect("/");
    }

    return (
        <div>
            <div className="flex h-fit w-full flex-wrap justify-center gap-2 p-4">
                <button className="h-20 w-32 rounded-full border-2 border-sky-400">
                    Book Appointment
                </button>
                <button className="h-20 w-32 rounded-full border-2 border-sky-400">
                    Gift Card Manager
                </button>
                <button className="h-20 w-32 rounded-full border-2 border-sky-400">
                    Sale
                </button>
                <button className="h-20 w-32 rounded-full border-2 border-sky-400">
                    Customer Finder
                </button>
            </div>
            {AdminTasks(user?.publicMetadata.Role === "admin")}
        </div>
    );
}

function AdminTasks(is_admin: boolean) {
    if (is_admin) {
        return (
            <div className="flex h-fit w-full flex-wrap justify-center gap-2 p-4">
                <a href={"/salon/tech-mana/nav/"}>
                    <button className="h-20 w-32 rounded-full border-2 border-sky-400">
                        Manage Technicians
                    </button>
                </a>
                <button className="h-20 w-32 rounded-full border-2 border-sky-400">
                    Daily Tally
                </button>
                <button className="h-20 w-32 rounded-full border-2 border-sky-400">
                    Weekly Tips
                </button>
                <button className="h-20 w-32 rounded-full border-2 border-sky-400">
                    Monthly View
                </button>
                <MigrationStation />
            </div>
        );
    }

    return;
}

function MigrationStation() {
    return (
        <a href="/salon/migration">
            <button className="h-20 w-32 rounded-full border-2 border-sky-400">
                Migration Station
            </button>
        </a>
    );
}
