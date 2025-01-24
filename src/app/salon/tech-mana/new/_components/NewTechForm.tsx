"use client";

import { Button, Input, Select, SelectItem } from "@heroui/react";
import TechPreview from "./TechPreview";
import type { Technician } from "~/server/db_schema/type_def";
import TechDisplayBar from "./TechDisplayBar";
import { to_technician } from "~/server/validation/db_types/technician_validation";
import { fetch_query, Method } from "~/app/api/api_query";
import { is_data_error } from "~/server/data_error";
import { useMutation } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useState } from "react";
import { sanitize_text_input } from "~/server/validation/text_sanitization";

type FormData = {
    name: string;
    text_color: string;
    text_intensity: string;
    bg_color: string;
    bg_intensity: string;
    border_color: string;
    border_intensity: string;
};

export function NewTechForm({
    starting_active_technicians,
    salon,
}: {
    starting_active_technicians: Technician[];
    salon: string;
}) {
    const [active_techs, set_active_techs] = useState(
        starting_active_technicians,
    );

    const [form_data, set_formdata] = useState({
        name: "Tinn",
        text_color: "sky",
        text_intensity: "300",
        bg_color: "slate",
        bg_intensity: "950",
        border_color: "sky",
        border_intensity: "500",
    });

    const [color_data, set_color_data] = useState(
        "border-sky-500 bg-slate-950 text-sky-300",
    );

    const [is_loading, set_loading] = useState(false);

    useEffect(() => {
        set_color_data(
            "border-".concat(
                form_data.border_color.toLowerCase(),
                "-",
                form_data.border_intensity,
                " ",
                "text-",
                form_data.text_color.toLowerCase(),
                "-",
                form_data.text_intensity,
                " ",
                "bg-",
                form_data.bg_color.toLowerCase(),
                "-",
                form_data.bg_intensity,
            ),
        );
    }, [form_data]);

    const create_new_tech = useMutation({
        mutationFn: async () => {
            const new_tech = await fetch_query({
                url: "/api/technician/create",
                method: Method.POST,
                params: {
                    data: {
                        name: form_data.name,
                        color: color_data,
                        active_salon: salon,
                    },
                },
                to: to_technician,
            });

            if (!is_data_error(new_tech)) {
                set_active_techs([new_tech, ...active_techs]);
            }

            set_loading(false);
        },

        mutationKey: ["create_technician", form_data],
    });

    function default_if_none(
        def: string,
        onChange: (value: string) => void,
    ): (e: ChangeEvent<HTMLSelectElement>) => void {
        return (e: ChangeEvent<HTMLSelectElement>) => {
            const value = e.target.value === "" ? def : e.target.value;
            onChange(value);
        };
    }

    const colors: string[] = [
        "Slate",
        "Gray",
        "Zinc",
        "Neutral",
        "Stone",
        "Red",
        "Orange",
        "Amber",
        "Yellow",
        "Lime",
        "Green",
        "Emerald",
        "Teal",
        "Cyan",
        "Sky",
        "Blue",
        "Indigo",
        "Violet",
        "Purple",
        "Fuchsia",
        "Pink",
        "Rose",
    ];
    const intensities: string[] = [
        "300",
        "400",
        "500",
        "600",
        "700",
        "800",
        "900",
        "950",
    ];

    return (
        <div className="flex h-fit w-full flex-wrap gap-2 p-2">
            <div className="flex h-fit w-full flex-nowrap justify-center border-b border-b-sky-400 p-2">
                <div className="flex w-1/2 max-w-96 gap-1 border-r border-sky-900 p-3">
                    <div className="flex flex-wrap gap-1">
                        <Input
                            onValueChange={(name: string) => {
                                set_formdata((data) => {
                                    return {
                                        ...data,
                                        name: sanitize_text_input(name),
                                    };
                                });
                            }}
                            isRequired
                            label="Name"
                            placeholder="Tinn"
                        />
                        <div className="flex w-full gap-1">
                            <Select
                                defaultSelectedKeys={["Sky"]}
                                onChange={default_if_none(
                                    "Sky",
                                    (value: string) => {
                                        set_formdata((data: FormData) => {
                                            return {
                                                ...data,
                                                text_color: value,
                                            };
                                        });
                                    },
                                )}
                                isRequired
                                label="Text Color"
                            >
                                {colors.map((color: string) => (
                                    <SelectItem key={color} value={color}>
                                        {color}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Select
                                defaultSelectedKeys={["300"]}
                                onChange={default_if_none(
                                    "300",
                                    (value: string) => {
                                        set_formdata((data: FormData) => {
                                            return {
                                                ...data,
                                                text_intensity: value,
                                            };
                                        });
                                    },
                                )}
                                isRequired
                                label="Text Color Intensity"
                            >
                                {intensities.map((intensity: string) => (
                                    <SelectItem
                                        key={intensity}
                                        value={intensity}
                                    >
                                        {intensity}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                        <div className="flex w-full gap-1">
                            <Select
                                defaultSelectedKeys={["Slate"]}
                                onChange={default_if_none(
                                    "Slate",
                                    (value: string) => {
                                        set_formdata((data: FormData) => {
                                            return {
                                                ...data,
                                                bg_color: value,
                                            };
                                        });
                                    },
                                )}
                                isRequired
                                label="Color"
                            >
                                {colors.map((color: string) => (
                                    <SelectItem key={color} value={color}>
                                        {color}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Select
                                defaultSelectedKeys={["950"]}
                                onChange={default_if_none(
                                    "950",
                                    (value: string) => {
                                        set_formdata((data: FormData) => {
                                            return {
                                                ...data,
                                                bg_intensity: value,
                                            };
                                        });
                                    },
                                )}
                                isRequired
                                label="Color Intensity"
                            >
                                {intensities.map((intensity: string) => (
                                    <SelectItem
                                        key={intensity}
                                        value={intensity}
                                    >
                                        {intensity}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                        <div className="flex w-full gap-1">
                            <Select
                                defaultSelectedKeys={["Sky"]}
                                onChange={default_if_none(
                                    "Sky",
                                    (value: string) => {
                                        set_formdata((data: FormData) => {
                                            return {
                                                ...data,
                                                border_color: value,
                                            };
                                        });
                                    },
                                )}
                                isRequired
                                label="Border"
                            >
                                {colors.map((color: string) => (
                                    <SelectItem key={color} value={color}>
                                        {color}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Select
                                defaultSelectedKeys={["500"]}
                                onChange={default_if_none(
                                    "500",
                                    (value: string) => {
                                        set_formdata((data: FormData) => {
                                            return {
                                                ...data,
                                                border_intensity: value,
                                            };
                                        });
                                    },
                                )}
                                isRequired
                                label="Border Intensity"
                            >
                                {intensities.map((intensity: string) => (
                                    <SelectItem
                                        key={intensity}
                                        value={intensity}
                                    >
                                        {intensity}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                        <Button
                            type="submit"
                            color="primary"
                            isDisabled={is_loading}
                            onPress={() => {
                                set_loading(true);
                                create_new_tech.mutate();
                            }}
                        >
                            {is_loading ? "Loading..." : "Create"}
                        </Button>
                    </div>
                </div>
                <TechPreview name={form_data.name} color={color_data} />
            </div>
            <TechDisplayBar
                technicians={active_techs.map((tech) => [tech, null])}
            />
        </div>
    );
}
