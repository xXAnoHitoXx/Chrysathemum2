"use client";

import { Button } from "@heroui/button";
import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { useState, FormEvent } from "react";
import { ano_iter, ano_chain_iter, AnoIter } from "~/util/anoiter/anoiter";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure,
} from "@heroui/react";
import { Method } from "~/app/api/api_query";
import { Technician } from "~/server/technician/type_def";
import { RosterEntry } from "~/server/technician/components/roster_entry";

export default function ClientSide({
    technicians,
    roster,
}: {
    technicians: Technician[];
    roster: RosterEntry[];
}) {
    const inactive_list: Technician[] = technicians.filter(
        (technician) => !technician.active,
    );

    const roster_ids: string[] = roster.map((entry) => entry.technician_id);

    const active_list: Technician[] = technicians.filter(
        (technician) =>
            technician.active && !roster_ids.includes(technician.id),
    );
    const at_this_location_list: Technician[] = technicians.filter(
        (technician) => technician.active && roster_ids.includes(technician.id),
    );

    const [current_location, current_location_tech_list] = useDragAndDrop<
        HTMLUListElement,
        Technician
    >(at_this_location_list, { group: "tech_management" });

    const [active, active_tech_list] = useDragAndDrop<
        HTMLUListElement,
        Technician
    >(active_list, { group: "tech_management" });

    const [inactive, inactive_tech_list] = useDragAndDrop<
        HTMLUListElement,
        Technician
    >(inactive_list, { group: "tech_management" });

    const initially_inactive_ids: string[] = inactive_list.map(
        (technician) => technician.id,
    );
    const initially_at_location_ids: string[] = at_this_location_list.map(
        (technician) => technician.id,
    );

    const { isOpen, onOpen: open_confirm_panel, onClose } = useDisclosure();

    const [is_loading, set_loading] = useState(false);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        set_loading(true);
        open_confirm_panel();
    }

    async function requests_changes() {
        const add_requests: AnoIter<Promise<Response>> = ano_iter(
            current_location_tech_list,
        )
            .ifilter((technician) => {
                return !initially_at_location_ids.includes(technician.id);
            })
            .imap((technician) =>
                fetch("/api/technician/location", {
                    method: Method.POST,
                    body: JSON.stringify(technician),
                }),
            );

        const remove_requests: AnoIter<Promise<Response>> = ano_chain_iter(
            active_tech_list,
            inactive_tech_list,
        )
            .ifilter((technician) =>
                initially_at_location_ids.includes(technician.id),
            )
            .imap((technician) =>
                fetch("/api/technician/location", {
                    method: Method.DELETE,
                    body: JSON.stringify(technician),
                }),
            );

        const activation_requests: AnoIter<Promise<Response>> = ano_iter(
            active_tech_list,
        )
            .ifilter((technician) =>
                initially_inactive_ids.includes(technician.id),
            )
            .imap((technician) =>
                fetch("/api/technician/activation", {
                    method: Method.PATCH,
                    body: JSON.stringify(technician),
                }),
            );

        const deactivation_requests: AnoIter<Promise<Response>> = ano_iter(
            inactive_tech_list,
        )
            .ifilter(
                (technician) => !initially_inactive_ids.includes(technician.id),
            )
            .imap((technician) =>
                fetch("/api/technician/deactivation", {
                    method: Method.PATCH,
                    body: JSON.stringify(technician),
                }),
            );

        const requests_iter: AnoIter<Promise<Response>> = ano_chain_iter(
            add_requests,
            remove_requests,
            activation_requests,
            deactivation_requests,
        );

        await Promise.all(requests_iter.collect());
    }

    return (
        <form
            onSubmit={onSubmit}
            className="flex h-fit w-full flex-wrap justify-start gap-1 p-2"
        >
            <h1>At Current Location</h1>
            <div className="flex h-28 w-full flex-nowrap overflow-x-auto border-b-2 border-sky-900">
                <ul
                    className="flex h-full w-fit min-w-full flex-nowrap gap-1"
                    ref={current_location}
                >
                    {current_location_tech_list.map((tech: Technician) => (
                        <li data-label={tech} key={tech.id}>
                            <button
                                disabled={true}
                                className={"border-2".concat(
                                    " ",
                                    tech.color,
                                    " ",
                                    "h-20 w-32 rounded-3xl",
                                )}
                            >
                                {tech.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <h1>Active Technician</h1>
            <div className="flex h-28 w-full flex-nowrap overflow-x-auto border-b-2 border-sky-900">
                <ul
                    className="flex h-full w-fit min-w-full flex-nowrap gap-1"
                    ref={active}
                >
                    {active_tech_list.map((tech: Technician) => (
                        <li data-label={tech} key={tech.id}>
                            <button
                                disabled={true}
                                className={"border-2".concat(
                                    " ",
                                    tech.color,
                                    " ",
                                    "h-20 w-32 rounded-3xl",
                                )}
                            >
                                {tech.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <h1>Inactive Technician</h1>
            <div className="flex h-28 w-full flex-nowrap overflow-x-auto border-b-2 border-sky-900">
                <ul
                    className="flex h-full w-fit min-w-full flex-nowrap gap-1"
                    ref={inactive}
                >
                    {inactive_tech_list.map((tech: Technician) => (
                        <li data-label={tech} key={tech.id}>
                            <button
                                className={"border-2".concat(
                                    " ",
                                    tech.color,
                                    " ",
                                    "h-20 w-32 rounded-3xl",
                                )}
                            >
                                {tech.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <Button type="submit" color="primary" isDisabled={is_loading}>
                {is_loading ? "Loading" : "Apply Changes"}
            </Button>
            <Modal
                backdrop="blur"
                onClose={onClose}
                isOpen={isOpen}
                scrollBehavior="inside"
                size="5xl"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Action Summary!</ModalHeader>
                            <ModalBody>
                                <h1>
                                    Move the following technicians to current
                                    Location
                                </h1>
                                <div className="flex h-28 w-full flex-nowrap overflow-x-auto border-b-2 border-sky-900">
                                    <div className="flex h-fit w-fit flex-nowrap gap-1">
                                        {ano_iter(current_location_tech_list)
                                            .ifilter(
                                                (technician) =>
                                                    !initially_at_location_ids.includes(
                                                        technician.id,
                                                    ),
                                            )
                                            .map((technician) => (
                                                <button
                                                    className={"border-2".concat(
                                                        " ",
                                                        technician.color,
                                                        " ",
                                                        "h-20 w-32 rounded-3xl",
                                                    )}
                                                    key={technician.id}
                                                >
                                                    {technician.name}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                                <h1>
                                    Remove the following technicians from
                                    current Location
                                </h1>
                                <div className="flex h-28 w-full flex-nowrap overflow-x-auto border-b-2 border-sky-900">
                                    <div className="flex h-fit w-fit flex-nowrap gap-1">
                                        {ano_chain_iter(
                                            active_tech_list,
                                            inactive_tech_list,
                                        )
                                            .ifilter((technician) =>
                                                initially_at_location_ids.includes(
                                                    technician.id,
                                                ),
                                            )
                                            .map((technician) => (
                                                <button
                                                    className={"border-2".concat(
                                                        " ",
                                                        technician.color,
                                                        " ",
                                                        "h-20 w-32 rounded-3xl",
                                                    )}
                                                    key={technician.id}
                                                >
                                                    {technician.name}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                                <h1>
                                    Mark the following technicians as active
                                </h1>
                                <div className="flex h-28 w-full flex-nowrap overflow-x-auto border-b-2 border-sky-900">
                                    <div className="flex h-fit w-fit flex-nowrap gap-1">
                                        {ano_iter(active_tech_list)
                                            .ifilter((technician) =>
                                                initially_inactive_ids.includes(
                                                    technician.id,
                                                ),
                                            )
                                            .map((technician) => (
                                                <button
                                                    className={"border-2".concat(
                                                        " ",
                                                        technician.color,
                                                        " ",
                                                        "h-20 w-32 rounded-3xl",
                                                    )}
                                                    key={technician.id}
                                                >
                                                    {technician.name}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                                <h1>
                                    Mark the following technicians as inactive
                                </h1>
                                <div className="flex h-28 w-full flex-nowrap overflow-x-auto border-b-2 border-sky-900">
                                    <div className="flex h-fit w-fit flex-nowrap gap-1">
                                        {ano_iter(inactive_tech_list)
                                            .ifilter(
                                                (technician) =>
                                                    !initially_inactive_ids.includes(
                                                        technician.id,
                                                    ),
                                            )
                                            .map((technician) => (
                                                <button
                                                    className={"border-2".concat(
                                                        " ",
                                                        technician.color,
                                                        " ",
                                                        "h-20 w-32 rounded-3xl",
                                                    )}
                                                    key={technician.id}
                                                >
                                                    {technician.name}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={() => {
                                        onClose();
                                    }}
                                >
                                    Close
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={async () => {
                                        onClose();
                                        await requests_changes();
                                        set_loading(false);
                                    }}
                                >
                                    Action
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </form>
    );
}
