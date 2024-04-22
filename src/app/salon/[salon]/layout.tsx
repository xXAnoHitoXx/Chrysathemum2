import { currentUser } from "@clerk/nextjs/server";
import SalonLeftNav from "./_component/SalonLeftNav";
import { redirect } from "next/navigation";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    if(!user) {
        redirect("/");
    }

    return (
        <div className="flex w-full flex-grow justify-start min-h-lvh">
            <SalonLeftNav is_admin={user.publicMetadata.Role === "admin"}/>
            {children}
        </div>
    );
}
