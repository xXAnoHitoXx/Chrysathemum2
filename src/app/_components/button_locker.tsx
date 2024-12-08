"use client";
import { useState } from "react";

export type ButtonSetControler = {
    is_locked: boolean;
    onClick: (on_click: () => void | Promise<void>) => () => Promise<void>;
};

export function use_button_controller(): ButtonSetControler {
    const [is_locked, set_is_locked] = useState(false);

    return {
        is_locked: is_locked,
        onClick: (on_click: () => void | Promise<void>) => {
            return async () => {
                set_is_locked(true);
                await on_click();
                set_is_locked(false);
            };
        },
    };
}
