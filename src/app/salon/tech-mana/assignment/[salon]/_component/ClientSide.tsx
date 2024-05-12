"use client"

import { Button } from "@nextui-org/button";
import { type Technician } from "~/server/db_schema/type_def";
import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { reduce } from "itertools";

export default function ClientSide({ technicians, roster, salon }: { technicians: Technician[], roster: string[], salon: string }) {
    const inactive_list: Technician[] = technicians.filter((technician) => (!technician.active));
    const active_list: Technician[] = technicians.filter((technician) => (technician.active && !roster.includes(technician.id)));
    const at_this_location_list: Technician[] = technicians.filter((technician) => (technician.active && roster.includes(technician.id)));

    const [current_location, current_location_tech_list] = useDragAndDrop<HTMLUListElement, Technician>(
        at_this_location_list,
        { group: "tech_management" }
    );

    const [active, active_tech_list] = useDragAndDrop<HTMLUListElement, Technician>(
        active_list,
        { group: "tech_management" }
    );

    const [inactive, inactive_tech_list] = useDragAndDrop<HTMLUListElement, Technician>(
        inactive_list,
        { group: "tech_management" }
    );

    const [is_loading, set_loading] = useState(false);
    const router = useRouter();

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        set_loading(true);

        function extract_url_arg(list: Technician[]): string {
            let arg: string | undefined = reduce(
                list.map((tech: Technician)=>(tech.id)),
                (arg: string, tech: string)=> (arg.concat(" ", tech)), 
                ""
            );

            if (arg == undefined || arg === "") {
                arg = "[]";
            } else {
                arg = arg.substring(1);
            }
            return arg;
        }

        const current_location_arg: string = extract_url_arg(current_location_tech_list);
        const active_arg: string = extract_url_arg(active_tech_list);

        router.replace("/salon/tech-mana/q/assign/".concat(current_location_arg, "/", active_arg, "/", salon));
        set_loading(false);
    };

    return (
        <form onSubmit={onSubmit} className="flex flex-wrap w-full h-fit justify-start p-2 gap-1">
            <h1>At Current Location</h1>
            <div className="flex flex-nowrap w-full h-28 border-b-2 border-sky-500 overflow-x-auto">
                <ul className="flex flex-nowrap w-fit h-full gap-1 min-w-full" ref={current_location}>
                    {current_location_tech_list.map((tech: Technician) => (
                        <li  data-label={tech} key={tech.id}>
                            <button className={"border-2 ".concat(tech.color, " rounded-3xl w-32 h-20")}>
                                {tech.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <h1>Active Technician</h1>
            <div className="flex flex-nowrap w-full h-28 border-b-2 border-sky-500 overflow-x-auto">
                <ul className="flex flex-nowrap w-fit h-full gap-1 min-w-full" ref={active}>
                    {active_tech_list.map((tech: Technician) => (
                        <li data-label={tech} key={tech.id}>
                            <button className={"border-2 ".concat(tech.color, " rounded-3xl w-32 h-20")}>
                                {tech.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <h1>Inactive Technician</h1>
            <div className="flex flex-nowrap w-full h-28 border-b-2 border-sky-500 overflow-x-auto">
                <ul className="flex flex-nowrap w-fit h-full gap-1 min-w-full" ref={inactive}>
                    {inactive_tech_list.map((tech: Technician) => (
                        <li data-label={tech} key={tech.id}>
                            <button className={"border-2 ".concat(tech.color, " rounded-3xl w-32 h-20")}>
                                {tech.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <Button type="submit" color="primary" isDisabled={is_loading}>Finish</Button>
        </form>
    );
}
