import { Button } from "@nextui-org/react";
import { TechnicianButton } from "~/app/salon/tech-mana/_component/TechDisplayBar";
import type { Technician } from "~/server/db/fb_schema";

export default function Preview({ params }: { params: { name: string, color: string } }) {
    const default_tech: Technician = {
        id: "preview",
        name: params.name,
        color: params.color.replaceAll("%20", " "),
    }; 
    return(
        <div className="flex w-1/2 h-grow justify-center">
            <div className="grid grid-cols-5 grid-rows-5 items-center p-4">
                <div className="col-start-3 row-start-3">
                    <TechnicianButton  technician={default_tech} link={null} />
                </div>
                <div className="col-start-1 row-start-5 place-items-center">
                    <Button type="submit" color="primary">Create</Button>
                </div>
            </div>
        </div>
    );
}
