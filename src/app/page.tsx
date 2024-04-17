import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"; 
import TopNav from "./_components/TopNav"

export const dynamic = "force-dynamic";

export default function HomePage() {
    return (
        <main>
            <TopNav/>
            <div className="flex w-full h-dvh justify-center">
                <div className="grid grid-cols-1 m-auto justify-items-center">
                    <SignedOut>
                        <SignInButton mode="modal"> 
                            <button className="w-32 h-20 border-4 border-sky-500 rounded-full">Sign In</button>
                        </SignInButton> 
                    </SignedOut>
                    <SignedIn>
                        <UserButton/> 
                    </SignedIn>
                </div>
            </div>
        </main>
    );
}
