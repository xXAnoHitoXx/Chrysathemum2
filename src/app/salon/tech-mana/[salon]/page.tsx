"use client"

import { Button, Input, Select, SelectItem } from '@nextui-org/react'
import { useState } from 'react'
import type { FormEvent } from 'react'
 
export default function TechMana() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
   
    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null) // Clear previous errors when a new request starts
   
        const form_data: FormData = new FormData(event.currentTarget);
        setTimeout(() => {
            setIsLoading(false);
        }, 3000);
    }
     
    return (
        <div className="flex flex-wrap w-full p-1 gap-2">
            <h1 className="w-full">Create New Tech</h1>
            <div className="flex w-full">
                <div className="flex w-1/2 p-3 gap-1 border-r border-sky-500">
                    {error && <div className="text-red-500 border border-red-500">{error}</div>}
                    <form onSubmit={onSubmit} className="flex flex-wrap gap-1">
                        <Input isRequired label="Name" placeholder="Tinn"/>
                        <div className="flex w-full gap-1">
                            <Select isRequired label="Text Color">
                                <SelectItem key="Blue" value="bg-blue-">Blue</SelectItem>
                            </Select>
                            <Select label="Text Color Intensity">
                                <SelectItem key="300" value="300">300</SelectItem>
                            </Select>
                        </div>
                        <div className="flex w-full gap-1">
                            <Select isRequired label="Color">
                                <SelectItem key="Blue" value="bg-blue-">Blue</SelectItem>
                            </Select>
                            <Select label="Color Intensity">
                                <SelectItem key="300" value="300">300</SelectItem>
                            </Select>
                        </div>
                        <div className="flex w-full gap-1">
                            <Select isRequired label="Border">
                                <SelectItem key="None" value="">None</SelectItem>
                            </Select>
                            <Select label="Border Intensity">
                                <SelectItem key="300" value="300">300</SelectItem>
                            </Select>
                        </div>
                        <Button type="submit" color="primary" isLoading={isLoading} isDisabled={isLoading}>
                            {isLoading ? "Loading..." : "Create"}
                        </Button>
                    </form>
                </div>

                <div className="flex w-1/2 h-grow justify-center">
                    <div className="grid grid-cols-1 items-center">
                        <button className="border-2 border-sky-400 rounded-3xl w-32 h-20">
                            Tinn
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
