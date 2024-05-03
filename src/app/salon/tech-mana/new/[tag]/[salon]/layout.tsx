import { get_all_technicians } from "~/server/queries/business/technician_queries";
import TechDisplayBar, { type ButtonData } from "./_components/TechDisplayBar";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    const technicians: ButtonData[] = (await get_all_technicians()).filter((tech) => { return tech.active }).map((tech) => ([ tech, null ]));

    return (
        <div className="flex flex-wrap w-full h-fit p-2 gap-2">
            {children}
            <TechDisplayBar technicians={technicians} />
        </div>
    );
}
