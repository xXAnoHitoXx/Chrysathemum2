import { get_active_technicians } from "~/server/queries/business/technician_queries";
import TechDisplayBar, { type ButtonData } from "./_components/TechDisplayBar";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    const technicians: ButtonData[] = (await get_active_technicians()).map((tech) => ([tech, null]));

    return (
        <div className="flex flex-wrap w-full h-fit p-2 gap-2">
            {children}
            <TechDisplayBar technicians={technicians} />
        </div>
    );
}
