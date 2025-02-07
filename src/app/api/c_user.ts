import { currentUser, User } from "@clerk/nextjs/server";
import { DataError } from "~/server/data_error";

export enum Role {
    Admin = "admin",
    Operator = "operator",
    Tech = "tech",
}

export async function check_user_permission(
    roles: Role[],
): Promise<User | DataError> {
    const user = await currentUser();
    if (!user) {
        return new DataError("not logged in");
    }

    for (const role of roles) {
        if (role === user.publicMetadata.Role) {
            return user;
        }
    }

    return new DataError("access denied");
}
