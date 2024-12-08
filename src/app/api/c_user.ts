import { currentUser } from "@clerk/nextjs/server";

export enum Role {
    Admin = "admin",
    Operator = "operator",
    Tech = "tech",
}

export async function require_permission(roles: Role[]): Promise<void> {
    const user = await currentUser();
    if (!user) {
        return Promise.reject("not logged in");
    }

    for (const role of roles) {
        if (role === user.publicMetadata.Role) {
            return;
        }
    }

    return Promise.reject("not permitted");
}
