import { Appointment } from "~/server/db_schema/type_def";
import { Board } from "./_component/board";

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode,
    params: { salon: string }
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

    return (
        <div className="flex flex-wrap p-2 gap-2">
            <a href={"/salon/nav/".concat(params.salon)}>
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Actions</button>
            </a>
            <div id="Appointment View" className="flex flex-nowrap w-full h-fit overflow-x-scroll">
                <Board appointments={appointments}/>
            </div>
            {children}
        </div>
    );
}
