import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Method } from "~/app/api/api_query";
import { handle_react_query_response } from "~/app/api/response_parser";
import { Technician } from "~/server/db_schema/type_def";
import { to_technician } from "~/server/validation/db_types/technician_validation";
import { to_array } from "~/server/validation/simple_type";

export function TechSelectBar(props: {
    on_select: (technician: Technician) => void;
}) {
    const [technicians, set_tech] = useState<Technician[]>([]);

    useQuery({
        queryFn: () =>
            fetch("/api/technician/location", {
                method: Method.GET,
                cache: "no-cache",
            }).then(
                handle_react_query_response(
                    to_array(to_technician),
                    (technicians) => {
                        set_tech(technicians);
                    },
                ),
            ),
        queryKey: ["technicians"],
        staleTime: 300000,
    });

    return (
        <div className="flex h-24 w-full flex-nowrap overflow-x-auto">
            <div className="flex h-fit w-fit flex-nowrap gap-1">
                {technicians.map((technician: Technician) => (
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
