import { Technician } from "~/server/db/fb_schema";
import { get_all_technicians } from "~/server/queries/technicians";

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: {
        salon: string,
    },
}) {
    const techs = await get_all_technicians();

    return (
        <div className="flex flex-wrap w-full h-fit p-2 gap-2">
            <div className="flex flex-nowrap w-full h-fit p-2 border-b border-b-sky-400">
                {techs.map(tech_button)}
            </div>
            {children}
        </div>
    );
}

function tech_button(tech: Technician) {
    return(
        <button className={tech.color.concat("rounded-full w-32 h-20")}>
            {tech.name}
        </button>
    );
}
