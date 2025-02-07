import { heroui } from "@heroui/react";
import { type Config } from "tailwindcss";

export default {
    content: [
        "./src/**/*.tsx",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            gridTemplateColumns: {
                "appointment-board": "repeat(52, minmax(60px, 60px))",
            },
            gridTemplateRows: {
                "appointment-board": "repeat(52, minmax(60px, 60px))",
            },
            gridRowStart: {
                "14": "14",
                "15": "15",
                "16": "16",
                "17": "17",
                "18": "18",
                "19": "19",
                "20": "20",
                "21": "21",
                "22": "22",
                "23": "23",
                "24": "24",
                "25": "25",
                "26": "26",
                "27": "27",
                "28": "28",
                "29": "29",
                "30": "30",
                "31": "31",
                "32": "32",
                "33": "33",
                "34": "34",
                "35": "35",
                "36": "36",
                "37": "37",
                "38": "38",
                "39": "39",
                "40": "40",
                "41": "41",
                "42": "42",
                "43": "43",
                "44": "44",
                "45": "45",
                "46": "46",
                "47": "47",
                "48": "48",
                "49": "49",
                "50": "50",
                "51": "51",
                "52": "52",
            },
            gridColumnStart: {
                "14": "14",
                "15": "15",
                "16": "16",
                "17": "17",
                "18": "18",
                "19": "19",
                "20": "20",
                "21": "21",
                "22": "22",
                "23": "23",
                "24": "24",
                "25": "25",
                "26": "26",
                "27": "27",
                "28": "28",
                "29": "29",
                "30": "30",
                "31": "31",
                "32": "32",
                "33": "33",
                "34": "34",
                "35": "35",
                "36": "36",
                "37": "37",
                "38": "38",
                "39": "39",
                "40": "40",
                "41": "41",
                "42": "42",
                "43": "43",
                "44": "44",
                "45": "45",
                "46": "46",
                "47": "47",
                "48": "48",
                "49": "49",
                "50": "50",
                "51": "51",
                "52": "52",
            },

            gridColumn: {
                "span-13": "span 13 / span 13",
                "span-14": "span 14 / span 14",
                "span-15": "span 15 / span 15",
                "span-16": "span 16 / span 16",
                "span-17": "span 17 / span 17",
                "span-18": "span 18 / span 18",
                "span-19": "span 19 / span 19",
                "span-20": "span 20 / span 20",
                "span-21": "span 21 / span 21",
                "span-22": "span 22 / span 22",
                "span-23": "span 23 / span 23",
                "span-24": "span 24 / span 24",
                "span-25": "span 25 / span 25",
                "span-26": "span 26 / span 26",
                "span-27": "span 27 / span 27",
                "span-28": "span 28 / span 28",
                "span-29": "span 29 / span 29",
                "span-30": "span 30 / span 30",
                "span-31": "span 31 / span 31",
                "span-32": "span 32 / span 32",
                "span-33": "span 33 / span 33",
                "span-34": "span 34 / span 34",
                "span-35": "span 35 / span 35",
                "span-36": "span 36 / span 36",
            },
        },
    },
    /*
    safelist: [
        {
            pattern:
                /text-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(300|400|500|600|700|800|900|950)/,
        },
        {
            pattern:
                /bg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(300|400|500|600|700|800|900|950)/,
        },
        {
            pattern:
                /border-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(300|400|500|600|700|800|900|950)/,
        },
        {
            pattern: /(col|row)-start-.+/,
        },
        {
            pattern: /col-span-.+/,
        },
        {
            pattern: /row-span-2/,
        },
    ],
    */
    plugins: [
        heroui({
            layout: {
                disabledOpacity: "0.3", // opacity-[0.3]
                radius: {
                    small: "2px", // rounded-small
                    medium: "4px", // rounded-medium
                    large: "6px", // rounded-large
                },
                borderWidth: {
                    small: "1px", // border-small
                    medium: "1px", // border-medium
                    large: "2px", // border-large
                },
            },
            themes: {
                light: {},
                dark: {},
            },
        }),
    ],
} satisfies Config;
