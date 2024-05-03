import { redirect } from "next/navigation";
import { create_new_technician } from "~/server/queries/business/technician_queries";

export default async function CreatTech({ params }: { params: { tag: string, salon: string, name: string, color: string } }) {
    const name_fmt = params.name.replaceAll("%20", " ");
    const color_fmt = params.color.replaceAll("%20", " ");

    await create_new_technician({ name: name_fmt, color: color_fmt });

    const new_tag = Number(params.tag) + 1;
    const path = "/salon/tech-mana/new/".concat(new_tag.toString(), "/", params.salon); 
    redirect(path);
}
