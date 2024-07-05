import { redirect } from "next/navigation";
import { get_current_user } from "~/app/api/c_user";

export default async function Nav() {

    const user = await get_current_user();

    if(!user){
        redirect("/");
    }

    return(
        <div>
            <div className="flex flex-wrap w-full h-fit p-4 gap-2 justify-center">
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Book Appointment</button>
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Gift Card Manager</button>
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Sale</button>
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Customer Finder</button>
            </div>
            {AdminTasks(user?.publicMetadata.Role === "admin")}
        </div>
    );
}

function AdminTasks(is_admin: boolean) {

    if (is_admin) {
        return(
            <div className="flex flex-wrap w-full h-fit p-4 gap-2 justify-center">
                <a href={"/salon/tech-mana/nav/"}>
                    <button className="border-2 border-sky-400 rounded-full w-32 h-20">Manage Technicians</button>
                </a>
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Daily Tally</button>
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Weekly Tips</button>
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Monthly View</button>
                <MigrationStation/>
            </div>
        );
    }

    return;
}

function MigrationStation() {
    return (
            <a href="/salon/migration">
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Migration Station</button>
            </a>
    );
}
