import { BisquitStore, set_bisquit } from "~/server/bisquit/bisquit";
import { is_data_error } from "~/server/data_error";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: Request): Promise<Response> {
    const user = await currentUser();
    if (!user) {
        return Response.json({ message: "not logged in" }, { status: 401 });
    }

    const bisquit = BisquitStore.safeParse(await request.json());

    if (!bisquit.success) {
        return Response.json(
            { message: bisquit.error.message },
            { status: 400 },
        );
    }

    const query = await set_bisquit(bisquit.data);

    if (is_data_error(query)) {
        return Response.json({ message: query.message() }, { status: 400 });
    }

    return Response.json({}, { status: 200 });
}
