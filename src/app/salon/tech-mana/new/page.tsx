import { get_all_technicians } from "~/server/queries/technicians";
import NewTechForm from "./_components/NewTechForm";
import TechDisplayBar from "~/app/salon/tech-mana/new/_components/TechDisplayBar";
import type { Technician } from "~/server/db/fb_schema";
import type { ButtonData } from "~/app/salon/tech-mana/new/_components/TechDisplayBar";

export default async function NewTech() {
    const buttons_data: ButtonData[] = ( await get_all_technicians() ).map((technicians: Technician)=> ( [ technicians, null ] ));

    return(
        <div className="flex flex-wrap w-full h-fit p-2 gap-2">
            <NewTechForm />
            <TechDisplayBar technicians={buttons_data} />
        </div>
    );
}
