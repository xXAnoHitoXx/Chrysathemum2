import { Appointment } from "~/server/db_schema/type_def";
import { Board } from "./_component/board";
import { get_bisquit } from "~/server/queries/crud/biscuits";
import { Bisquit } from "~/server/validation/bisquit";
import { redirect } from "next/navigation";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode,
}) {

    const appointments: Appointment[] = [
        {
            id: "Banana",
            customer: { id: "PoopyPooh", name: "Poopy Poo Bert", phone_number: "your mother", notes: "" },
            technician: null,
            date: "idk_lol",
            duration: 4,
            time: 15,
            details: "alotanothn",
        }
    ];

    const salon = get_bisquit(Bisquit.salon_selection);
    if(salon == undefined) {
        redirect("/");
    }

    return (
        <div className="flex flex-wrap p-2 gap-2">
            <a href={"/salon/nav/".concat(salon)}>
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Actions</button>
            </a>
            <div id="Appointment View" className="flex flex-nowrap w-full h-fit overflow-x-scroll">
                <Board appointments={appointments}/>
            </div>
            {children}
        </div>
    );
}
