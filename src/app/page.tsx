import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import SalonSelect from "./_components/salon_select";
import RetryRedirect from "./_components/retry_redirect";
import { currentUser } from "@clerk/nextjs/server";
import { Role } from "./api/c_user";

export const dynamic = "force-dynamic";

export default async function HomePage() {
    const user = await currentUser();

    if (user) {
        const is_manager =
            user.publicMetadata.Role === Role.Admin ||
            user.publicMetadata.Role === Role.Operator;

        const next_page =
            user.publicMetadata.Role === Role.Tech
                ? "/tech/inf"
                : is_manager
                  ? "/salon/app-view"
                  : "/booking";
        return <SalonSelect next_page={next_page} />;
    }

    return (
        <div className="flex h-dvh w-full justify-center">
            <div className="m-auto grid grid-cols-1 justify-items-center">
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="h-20 w-32 rounded-full border-4 border-sky-900">
                            Sign In
                        </button>
                    </SignInButton>
                </SignedOut>
                <SignedIn>
                    <RetryRedirect />
                </SignedIn>
            </div>
        </div>
    );
}
