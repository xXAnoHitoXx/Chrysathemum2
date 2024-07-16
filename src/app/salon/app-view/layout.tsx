import { Appointment } from "~/server/db_schema/type_def";
import { Board } from "./_component/board";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode,
}) {

    const appointments: Appointment[] = [
        {
            id: "Banana",
            customer: {
                id: "ana",
                name: "Poopy Poo",
                phone_number: "(FaQ) yur-moma",
                notes: "",
            },
            technician: null,
            date: 111080,
            duration: 4,
            time: 15,
            details: "alotanothn",
        }
    ];

    return (
        <div className="flex flex-wrap p-2 gap-2">
            <a href="/salon/nav/">
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Actions</button>
            </a>
            <div id="AppointmentEntry View" className="flex flex-nowrap w-full h-fit overflow-x-scroll">
                <Board appointments={appointments}/>
            </div>
            {children}
        </div>
    );
}
