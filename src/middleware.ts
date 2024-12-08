import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

const is_protected_route = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    const auth_data = await auth();

    if (!auth_data.userId && is_protected_route(req)) {
        return auth_data.redirectToSignIn();
    }
});
