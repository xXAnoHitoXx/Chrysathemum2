import { Technician } from "~/server/technician/type_def";
import { TechnicianButton } from "./TechDisplayBar";

export default function TechPreview({
    name,
    color,
}: {
    name: string;
    color: string;
}) {
    const default_tech: Technician = {
        id: "preview",
        name: name,
        color: color,
        active: true,
        login_claimed: undefined,
    };
    return (
        <div className="h-grow flex w-1/2 max-w-96 justify-center">
            <div className="grid grid-cols-1 items-center p-4">
                <TechnicianButton technician={default_tech} link={null} />
            </div>
        </div>
    );
}
