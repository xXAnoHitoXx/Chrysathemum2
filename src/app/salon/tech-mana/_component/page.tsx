"use client"

import { Button, Input, Select, SelectItem } from '@nextui-org/react'
import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { get_bg_color, get_border_color, get_text_color } from '../../_helpers/tech_colors';
import classNames from 'classnames';
 
export default function TechMana() {
    const [is_loading, set_is_loading] = useState<boolean>(false);
    const [name, set_name] = useState<string>(""); 
    const [text_color, set_text_color] = useState<string>("sky");
    const [text_intensity, set_text_intensity] = useState<string>("300");
    const [bg_color, set_bg_color] = useState<string>("slate");
    const [bg_intensity, set_bg_intensity] = useState<string>("950");
    const [border_color, set_border_color] = useState<string>("sky");
    const [border_intensity, set_border_intensity] = useState<string>("500");

    const handle_text_color_change = (e: ChangeEvent<HTMLSelectElement>) => {
        const text_color = (e.target.value === "")? "sky" : e.target.value;
        set_text_color(text_color);
    };

    const handle_text_insensity_change = (e: ChangeEvent<HTMLSelectElement>) => {
        const text_intensity = (e.target.value === "")? "300" : e.target.value;
        set_text_intensity(text_intensity);
    };

    const handle_bg_color_change = (e: ChangeEvent<HTMLSelectElement>) => {
        const bg_color = (e.target.value === "")? "slate" : e.target.value;
        set_bg_color(bg_color);
    };

    const handle_bg_intensity_change = (e: ChangeEvent<HTMLSelectElement>) => {
        const bg_intensity = (e.target.value === "")? "950" : e.target.value;
        set_bg_intensity(bg_intensity);
    };

    const handle_border_color_change = (e: ChangeEvent<HTMLSelectElement>) => {
        const border_color = (e.target.value === "")? "sky" : e.target.value;
        set_border_color(border_color);
    };

    const handle_border_intensity_change = (e: ChangeEvent<HTMLSelectElement>) => {
        const border_intensity = (e.target.value === "")? "500" : e.target.value;
        set_border_intensity(border_intensity);
    };

    const colors: string[] = [
        "Slate", "Gray", "Zinc", "Neutral", "Stone", 
        "Red", "Orange", "Amber", "Yellow", "Lime", "Green", 
        "Emerald", "Teal", "Cyan", "Sky", "Blue", "Indigo",
        "Violet", "Purple", "Fuchsia", "Pink", "Rose"
    ];
    const intensities: string[] = ["300", "400", "500", "600", "700", "800", "900", "950"];

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        set_is_loading(true)
   
        setTimeout(() => {
            set_is_loading(false);
        }, 3000);
    }
     
    return (
        <div className="flex flex-wrap w-full p-1 gap-2">
            <h1 className="w-full">Create New Tech</h1>
            <div className="flex w-full">
                <div className="flex w-1/2 p-3 gap-1 border-r border-sky-500">
                    <form onSubmit={onSubmit} className="flex flex-wrap gap-1">
                        <Input onValueChange={set_name} isRequired label="Name" placeholder="Tinn"/>
                        <div className="flex w-full gap-1">
                            <Select onChange={handle_text_color_change} isRequired label="Text Color">
                                { colors.map((color: string) => ( <SelectItem key={color} value={color}>{color}</SelectItem> ) ) }
                            </Select>
                            <Select onChange={handle_text_insensity_change} isRequired label="Text Color Intensity">
                                { intensities.map((intensity: string) => ( <SelectItem key={intensity} value={intensity}>{intensity}</SelectItem> ) ) }
                            </Select>
                        </div>
                        <div className="flex w-full gap-1">
                            <Select onChange={handle_bg_color_change} isRequired label="Color">
                                { colors.map((color: string) => ( <SelectItem key={color} value={color}>{color}</SelectItem> ) ) }
                            </Select>
                            <Select onChange={handle_bg_intensity_change} isRequired label="Color Intensity">
                                { intensities.map((intensity: string) => ( <SelectItem key={intensity} value={intensity}>{intensity}</SelectItem> ) ) }
                            </Select>
                        </div>
                        <div className="flex w-full gap-1">
                            <Select onChange={handle_border_color_change} isRequired label="Border">
                                { colors.map((color: string) => ( <SelectItem key={color} value={color}>{color}</SelectItem> ) ) }
                            </Select>
                            <Select onChange={handle_border_intensity_change} isRequired label="Border Intensity">
                                { intensities.map((intensity: string) => ( <SelectItem key={intensity} value={intensity}>{intensity}</SelectItem> ) ) }
                            </Select>
                        </div>
                        <Button type="submit" color="primary" isLoading={is_loading} isDisabled={is_loading}>
                            {is_loading ? "Loading..." : "Create"}
                        </Button>
                    </form>
                </div>

                <div className="flex w-1/2 h-grow justify-center">
                    <div className="grid grid-cols-1 items-center">
                        {preview_button(
                            text_color.toLowerCase().concat(text_intensity), 
                            bg_color.toLowerCase().concat(bg_intensity),
                            border_color.toLowerCase().concat(border_intensity),
                            name
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function preview_button(text_color: string, bg_color: string, border_color: string, tech_name: string){

    return(<button className={classNames(
        "border-2", 
        get_border_color(border_color), 
        get_text_color(text_color), 
        get_bg_color(bg_color), 
        "rounded-3xl", "w-32", "h-20")}>{tech_name}</button>);
}
