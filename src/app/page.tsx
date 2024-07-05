import { SignInButton } from "@clerk/nextjs"; 
import { redirect } from "next/navigation";
import { get_current_user } from "./api/c_user";
import SalonSelect from "./_component/salon_select";

export const dynamic = "force-dynamic";

export default async function HomePage() {
    const user = await get_current_user();

    if (user) {
        if (user.publicMetadata.Role === "tech") {
            redirect("/tech");
        } 

        const is_manager = user.publicMetadata.Role === "admin" || user.publicMetadata.Role === "operator";
        return <SalonSelect is_admin={is_manager} />;
    }

    return (
        <div className="flex w-full h-dvh justify-center">
            <div className="grid grid-cols-1 m-auto justify-items-center">
                <SignInButton mode="modal"> 
                    <button className="w-32 h-20 border-4 border-sky-500 rounded-full">
                        Sign In
                    </button>
                </SignInButton> 
            </div>
        </div>
    );
}
