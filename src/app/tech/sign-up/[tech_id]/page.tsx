import { SignedOut, SignUpButton } from "@clerk/nextjs";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Role } from "~/app/api/c_user";
import { is_data_error } from "~/server/data_error";
import { FireDB } from "~/server/fire_db";
import {
    retrieve_technician_entry,
    update_technician_entry,
} from "~/server/technician/components/technician_entry";

export default async function Page({
    params,
}: {
    params: Promise<{ tech_id: string }>;
}) {
    const user = await currentUser();

    const { tech_id }: { tech_id: string } = await params;

    if (user == null) {
        return (
            <div className="flex h-full w-full justify-center">
                <div className="m-auto grid grid-cols-1 justify-items-center">
                    <SignedOut>
                        <SignUpButton
                            mode="modal"
                            fallbackRedirectUrl={`/tech/sign-up/${tech_id}`}
                            signInFallbackRedirectUrl={`/tech/sign-up/${tech_id}`}
                        >
                            <button className="h-20 w-32 rounded-full border-4 border-sky-900">
                                Sign Up
                            </button>
                        </SignUpButton>
                    </SignedOut>
                </div>
            </div>
        );
    }

    const tech = await retrieve_technician_entry.call(
        { tech_id: tech_id },
        FireDB.active(),
    );

    if (is_data_error(tech)) {
        redirect("/");
    }

    if (tech.login_claimed != undefined) {
        redirect("/");
    }

    tech.login_claimed = user.id;
    const update = await update_technician_entry.call(tech, FireDB.active());

    if (is_data_error(update)) {
        redirect("/");
    }

    const client = await clerkClient();

    await client.users.updateUserMetadata(user.id, {
        publicMetadata: {
            Role: Role.Tech,
            Tech_id: tech.id,
        },
    });

    redirect("/");
}
