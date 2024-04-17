import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"; 

export default function TopNav() {
    return (
        <nav id="top-nav" className="flex w-full items-center justify-between border-b p-4 text-xl font-semibold">

            <div>Chrysanthemum Spa</div>

            <div>
                <SignedOut>
                    <SignInButton/> 
                </SignedOut>
                <SignedIn>
                    <UserButton/> 
                </SignedIn>
            </div>

        </nav>
    );
}
