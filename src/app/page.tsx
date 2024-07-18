import { SignInButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { get_current_user } from "./api/c_user";
import SalonSelect from "./_components/salon_select";

export const dynamic = "force-dynamic";

export default async function HomePage() {
    const user = await get_current_user();

    if (user) {
        if (user.publicMetadata.Role === "tech") {
            redirect("/tech");
        }

        const is_manager =
            user.publicMetadata.Role === "admin" ||
            user.publicMetadata.Role === "operator";
        return <SalonSelect is_admin={is_manager} />;
    }

    return (
        <div className="flex h-dvh w-full justify-center">
            <div className="m-auto grid grid-cols-1 justify-items-center">
                <SignInButton mode="modal">
                    <button className="h-20 w-32 rounded-full border-4 border-sky-500">
                        Sign In
                    </button>
                </SignInButton>
            </div>
        </div>
    );
}
