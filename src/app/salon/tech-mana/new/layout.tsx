import type { Technician } from "~/server/db/fb_schema";
import type { ButtonData } from "../_component/TechDisplayBar";
import { get_all_technicians } from "~/server/queries/technicians";
import TechDisplayBar from "../_component/TechDisplayBar";
import NewTechForm from "./_components/NewTechForm";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const buttons_data: ButtonData[] = ( await get_all_technicians() ).map((technicians: Technician)=> ( [ technicians, null ] ));

    return (
        <div className="flex flex-wrap w-full h-fit p-2 gap-2">
            <TechDisplayBar technicians={buttons_data} />
            <div className="flex flex-nowrap w-full h-fit p-2 border-b border-b-sky-400">
                <NewTechForm />
                {children}
            </div>
        </div>
    );
}
