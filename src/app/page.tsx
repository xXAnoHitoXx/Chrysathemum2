import { SignInButton } from "@clerk/nextjs"; 
import { redirect } from "next/navigation";
import { get_current_user } from "./api/c_user";

export const dynamic = "force-dynamic";

export default async function HomePage() {
    const user = await get_current_user();

    if (user) {
        if (user.publicMetadata.Role === "tech") {
            redirect("/tech");
        } 

        const is_manager = user.publicMetadata.Role === "admin" || user.publicMetadata.Role === "operator";

        return SalonSelect(is_manager);
    }

    return (
        <main>
            <div className="flex w-full h-dvh justify-center">
                <div className="grid grid-cols-1 m-auto justify-items-center">
                    <SignInButton mode="modal"> 
                        <button className="w-32 h-20 border-4 border-sky-500 rounded-full">
                            Sign In
                        </button>
                    </SignInButton> 
                </div>
            </div>
        </main>
    );
}

function SalonSelect(admin: boolean) {
    const next_page : string = (admin) ? "/salon" : "/booking";

    return (
        <main>
            <div className="flex w-full h-dvh justify-center">
                <div className="grid grid-cols-1 m-auto justify-items-center">
                    <a href={next_page.concat("/5CBL")}> 
                        <button className="w-32 h-20 border-4 border-sky-500 rounded-full">
                            5 Cumberland
                        </button>
                    </a> 
                </div>
            </div>
        </main>
    );
}
