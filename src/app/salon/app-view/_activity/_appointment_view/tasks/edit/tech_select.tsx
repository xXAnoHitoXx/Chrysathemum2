import { Technician } from "~/server/technician/type_def";
import { bubble_sort } from "~/util/sorter/ano_bubble_sort";

export function TechSelectBar(props: {
    technicians: Technician[];
    on_select: (technician: Technician) => void;
}) {
    bubble_sort(props.technicians, (t1, t2) => {
        if (t1.name === "NoShow") {
            return 1;
        }
        if (t2.name === "NoShow") {
            return -1;
        }
        if (t1.name === "Sale") {
            return 1;
        }
        if (t2.name === "Sale") {
            return -1;
        }
        return t1.id.localeCompare(t2.name);
    });

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
