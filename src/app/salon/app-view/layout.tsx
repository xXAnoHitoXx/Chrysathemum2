import { Appointment } from "~/server/db_schema/type_def";
import { Board } from "./_component/board";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
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
        },
    ];

    return (
        <div className="flex flex-wrap gap-2 p-2">
            <a href="/salon/nav/">
                <button className="h-20 w-32 rounded-full border-2 border-sky-400">
                    Actions
                </button>
            </a>
            <div
                id="AppointmentEntry View"
                className="flex h-fit w-full flex-nowrap overflow-x-scroll"
            >
                <Board appointments={appointments} />
            </div>
            {children}
        </div>
    );
}
