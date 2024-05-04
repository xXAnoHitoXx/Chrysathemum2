"use client"

import { Button, Input, Select, SelectItem } from '@nextui-org/react'
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react'
import TechPreview from './_components/TechPreview'; 
import sanitizer from '~/server/validation/text_sanitization'

export default function NewTechForm({ params }: {params : { tag: string, salon: string }}) {
    const [name, set_name] = useState("Tinn");
    const [text_color, set_text_color] = useState("sky");
    const [text_intensity, set_text_intensity] = useState("300");
    const [bg_color, set_bg_color] = useState("slate");
    const [bg_intensity, set_bg_intensity] = useState("950");
    const [border_color, set_border_color] = useState("sky");
    const [border_intensity, set_border_intensity] = useState("500");
    const [color_data, set_color_data] = useState("border-sky-500 bg-slate-950 text-sky-300");
    const [is_loading, set_is_loading] = useState(false);

    const router = useRouter();

    function update_style(text_color:string, text_intensity:string, bg_color:string, bg_intensity:string, border_color:string, border_intensity:string) {
        set_color_data( "border-".concat(
            border_color.toLowerCase(), "-", border_intensity, " ",
            "text-", text_color.toLowerCase(), "-", text_intensity, " ",
            "bg-", bg_color.toLowerCase(), "-", bg_intensity
        ));
    }

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        set_is_loading(true);
        router.replace("/salon/tech-mana/create/".concat(params.tag, "/", params.salon, "/", name, "/", color_data));
        set_is_loading(false);
    };
    
    const name_change = (new_name: string) => {
        set_name(sanitizer(new_name));
    }

    const handle_text_color_change = (e: ChangeEvent<HTMLSelectElement>) => {
        const text_color = (e.target.value === "")? "sky" : e.target.value;
        set_text_color(text_color);
        update_style(text_color, text_intensity, bg_color, bg_intensity, border_color, border_intensity);
    };

    const handle_text_insensity_change = (e: ChangeEvent<HTMLSelectElement>) => {
        const text_intensity = (e.target.value === "")? "300" : e.target.value;
        set_text_intensity(text_intensity);
        update_style(text_color, text_intensity, bg_color, bg_intensity, border_color, border_intensity);
    };

    const handle_bg_color_change = (e: ChangeEvent<HTMLSelectElement>) => {
        const bg_color = (e.target.value === "")? "slate" : e.target.value;
        set_bg_color(bg_color);
        update_style(text_color, text_intensity, bg_color, bg_intensity, border_color, border_intensity);
    };

    const handle_bg_intensity_change = (e: ChangeEvent<HTMLSelectElement>) => {
        const bg_intensity = (e.target.value === "")? "950" : e.target.value;
        set_bg_intensity(bg_intensity);
        update_style(text_color, text_intensity, bg_color, bg_intensity, border_color, border_intensity);
    };

    const handle_border_color_change = (e: ChangeEvent<HTMLSelectElement>) => {
        const border_color = (e.target.value === "")? "sky" : e.target.value;
        set_border_color(border_color);
        update_style(text_color, text_intensity, bg_color, bg_intensity, border_color, border_intensity);
    };

    const handle_border_intensity_change = (e: ChangeEvent<HTMLSelectElement>) => {
        const border_intensity = (e.target.value === "")? "500" : e.target.value;
        set_border_intensity(border_intensity);
        update_style(text_color, text_intensity, bg_color, bg_intensity, border_color, border_intensity);
    };

    const colors: string[] = [
        "Slate", "Gray", "Zinc", "Neutral", "Stone", 
        "Red", "Orange", "Amber", "Yellow", "Lime", "Green", 
        "Emerald", "Teal", "Cyan", "Sky", "Blue", "Indigo",
        "Violet", "Purple", "Fuchsia", "Pink", "Rose"
    ];
    const intensities: string[] = ["300", "400", "500", "600", "700", "800", "900", "950"];

    return (
        <div className="flex flex-nowrap justify-center w-full h-fit p-2 border-b border-b-sky-400">
            <div className="flex w-1/2 max-w-96 p-3 gap-1 border-r border-sky-500">
                <form onSubmit={onSubmit} className="flex flex-wrap gap-1">
                    <Input onValueChange={name_change} isRequired label="Name" placeholder="Tinn"/>
                    <div className="flex w-full gap-1">
                        <Select defaultSelectedKeys={["Sky"]} onChange={handle_text_color_change} isRequired label="Text Color">
                            { colors.map((color: string) => ( <SelectItem key={color} value={color}>{color}</SelectItem> ) ) }
                        </Select>
                        <Select defaultSelectedKeys={["300"]} onChange={handle_text_insensity_change} isRequired label="Text Color Intensity">
                            { intensities.map((intensity: string) => ( <SelectItem key={intensity} value={intensity}>{intensity}</SelectItem> ) ) }
                        </Select>
                    </div>
                    <div className="flex w-full gap-1">
                        <Select defaultSelectedKeys={["Slate"]} onChange={handle_bg_color_change} isRequired label="Color">
                            { colors.map((color: string) => ( <SelectItem key={color} value={color}>{color}</SelectItem> ) ) }
                        </Select>
                        <Select defaultSelectedKeys={["950"]} onChange={handle_bg_intensity_change} isRequired label="Color Intensity">
                            { intensities.map((intensity: string) => ( <SelectItem key={intensity} value={intensity}>{intensity}</SelectItem> ) ) }
                        </Select>
                    </div>
                    <div className="flex w-full gap-1">
                        <Select defaultSelectedKeys={["Sky"]} onChange={handle_border_color_change} isRequired label="Border">
                            { colors.map((color: string) => ( <SelectItem key={color} value={color}>{color}</SelectItem> ) ) }
                        </Select>
                        <Select defaultSelectedKeys={["500"]} onChange={handle_border_intensity_change} isRequired label="Border Intensity">
                            { intensities.map((intensity: string) => ( <SelectItem key={intensity} value={intensity}>{intensity}</SelectItem> ) ) }
                        </Select>
                    </div>
                    <Button type="submit" color="primary" isDisabled={is_loading}>
                        {is_loading ? "Loading..." : "Create"}
                    </Button>
                </form>
            </div>
            <TechPreview name={name} color={color_data} />
        </div>
    );
}
