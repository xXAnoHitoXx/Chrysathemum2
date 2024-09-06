import { Technician } from "~/server/db_schema/type_def";

export function TechSelectBar(props: {
    technicians: Technician[];
    on_select: (technician: Technician) => void;
}) {
    return (
        <div className="flex h-24 w-full flex-nowrap overflow-x-auto">
            <div className="flex h-fit w-fit flex-nowrap gap-1">
                {props.technicians.map((technician: Technician) => (
                    <button
                        className={"border-2".concat(
                            " ",
                            technician.color,
                            " ",
                            "h-20 w-32 rounded-3xl",
                        )}
                        onClick={() => {
                            props.on_select(technician);
                        }}
                    >
                        {technician.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
