import { nextui } from "@nextui-org/react";
import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
    content: [
        "./src/**/*.tsx",
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-sans)", ...fontFamily.sans],
            },
            gridTemplateColumns: {
                'appointment-board': 'repeat(52, minmax(60px, 60px))',
            },
            gridColumnStart: {
                '14':'14', '15':'15', '16':'16', '17':'17', '18':'18',
                '19':'19', '20':'20', '21':'21', '22':'22', '23':'23',
                '24':'24', '25':'25', '26':'26', '27':'27', '28':'28',
                '29':'29', '30':'30', '31':'31', '32':'32', '33':'33',
                '34':'34', '35':'35', '36':'36', '37':'37', '38':'38',
                '39':'39', '40':'40', '41':'41', '42':'42', '43':'43',
                '44':'44', '45':'45', '46':'46', '47':'47', '48':'48',
                '49':'49', '50':'50', '51':'51', '52':'52',
           }
        },
    },

    safelist: [
        {
            pattern: /text-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(300|400|500|600|700|800|900|950)/
        },
        {
            pattern: /bg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(300|400|500|600|700|800|900|950)/
        },
        {
            pattern: /border-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(300|400|500|600|700|800|900|950)/
        },
        {
            pattern:/col-start-.+/
        },
    ],


    darkMode: "class",
    plugins: [nextui()]
} satisfies Config;
