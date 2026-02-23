import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
    '/',                    // Root/home page
    '/sign-in(.*)',         // Sign-in pages
    '/sign-up(.*)',         // Sign-up pages
    '/api/webhook(.*)',     // Webhook routes
]);

export default clerkMiddleware(async (auth, request) => {
    // Only protect routes that are NOT public
    if (!isPublicRoute(request)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};