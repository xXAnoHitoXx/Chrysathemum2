import { User, currentUser } from "@clerk/nextjs/server";

//why wasn't it done this way to begin with
export async function get_current_user(): Promise<User | null> {
    try {
        const user = await currentUser();
        return user;
    } catch {
        return null;
    }
}
