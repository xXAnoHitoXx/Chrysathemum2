import { TechnicianButton } from "./TechDisplayBar"; 
import type { Technician } from "~/server/db_schema/type_def"; 

export default function TechPreview({ name , color }: { name: string, color: string }) {
    const default_tech: Technician = {
       id: "preview",
        name: name,
        color: color,
        active: true,
    }; 
    return(
        <div className="flex w-1/2 max-w-96 h-grow justify-center">
            <div className="grid grid-cols-1 items-center p-4">
                <TechnicianButton technician={default_tech} link={null} />
            </div>
        </div>
    );
}
