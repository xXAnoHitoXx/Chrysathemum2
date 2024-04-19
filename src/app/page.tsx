import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs"; 

export const dynamic = "force-dynamic";

export default function HomePage() {
    return (
        <main>
            <div className="flex w-full h-dvh justify-center">
                <SignedOut>
                    <div className="grid grid-cols-1 m-auto justify-items-center">
                        <SignInButton mode="modal"> 
                            <button className="w-32 h-20 border-4 border-sky-500 rounded-full">
                                Sign In
                            </button>
                        </SignInButton> 
                    </div>
                </SignedOut>
                <SignedIn>
                    <div className="grid grid-cols-2 m-auto justify-items-center">
                        <a href="/sal/5CBL">
                            <button className="w-32 h-20 border-4 border-sky-500 rounded-full">
                                5 Cumberland Dr
                            </button>
                        </a>
                    </div>
                </SignedIn>
            </div>
        </main>
    );
}
