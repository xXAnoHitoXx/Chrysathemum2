import { require_permission, Role } from "~/app/api/c_user";

export default async function Page() {
    require_permission([Role.Tech]);

    return (
        <div>
            Not yet implemented
        </div>
    );
}
