import type { Technician } from "~/server/db_schema/fb_schema"; 

export type ButtonData = [Technician, string | null];

export default function TechDisplayBar({ technicians }: { technicians: ButtonData[] }) {
    return (
        <div className="flex flex-nowrap w-full h-24 overflow-x-auto">
            <div className="flex flex-nowrap w-fit h-fit gap-1">
            { technicians.map((tech: ButtonData) => ( <TechnicianButton key={tech[0].id} technician={tech[0]} link={tech[1]}/>) ) }
            </div>
        </div>
    );
}

export function TechnicianButton({ technician, link }: { technician: Technician, link: string | null }) {
    if (link == null){
        return <button className={"border-2 ".concat(technician.color, " rounded-3xl w-32 h-20")}>{technician.name}</button>;
    }

    return (
        <a href={link}>
        <button className={"border-2 ".concat(technician.color, " rounded-3xl w-32 h-20")}>{technician.name}</button>
        </a>
    );
}
