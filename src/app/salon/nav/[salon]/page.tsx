import { currentUser } from "@clerk/nextjs/server";

export default async function Nav({ params }: { params: { salon: string } }) {

    const user = await currentUser();

    return(
        <div>
            <div className="flex flex-wrap w-full h-fit p-4 gap-2 justify-center">
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Book Appointment</button>
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Gift Card Manager</button>
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Sale</button>
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Customer Finder</button>
            </div>
            {AdminTasks(user?.publicMetadata.Role === "admin", params.salon)}
        </div>
    );
}

function AdminTasks(is_admin: boolean, salon: string) {

    if (is_admin) {
        return(
            <div className="flex flex-wrap w-full h-fit p-4 gap-2 justify-center">
                <a href={"/salon/tech-mana/".concat(salon)}>
                    <button className="border-2 border-sky-400 rounded-full w-32 h-20">Manage Technicians</button>
                </a>
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Daily Tally</button>
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Weekly Tips</button>
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Monthly View</button>
            </div>
        );
    }

    return;
}
