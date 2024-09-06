import type { Technician } from "~/server/db_schema/type_def";

export type ButtonData = [Technician, string | null];

export default function TechDisplayBar({
    technicians,
}: {
    technicians: ButtonData[];
}) {
    return (
        <div className="flex h-24 w-full flex-nowrap overflow-x-auto">
            <div className="flex h-fit w-fit flex-nowrap gap-1">
                {technicians.map((tech: ButtonData) => (
                    <TechnicianButton
                        key={tech[0].id}
                        technician={tech[0]}
                        link={tech[1]}
                    />
                ))}
            </div>
        </div>
    );
}

export function TechnicianButton({
    technician,
    link,
}: {
    technician: Technician;
    link: string | null;
}) {
    if (link == null) {
        return (
            <button
                className={"border-2".concat(
                    " ",
                    technician.color,
                    " ",
                    "h-20 w-32 rounded-3xl",
                )}
            >
                {technician.name}
            </button>
        );
    }

    return (
        <a href={link}>
            <button
                className={"border-2".concat(
                    " ",
                    technician.color,
                    " ",
                    "h-20 w-32 rounded-3xl",
                )}
            >
                {technician.name}
            </button>
        </a>
    );
}
