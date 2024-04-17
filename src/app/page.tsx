import { d_db } from "~/server/db";
import TopNav from "./_components/TopNav"

export const dynamic = "force-dynamic";

export default async function HomePage() {
    const posts = await d_db.query.posts.findMany();

    return (
        <main>
            <TopNav/>
            <div className="flex flex-wrap gap-4">
                {posts.map((post) => (
                <div key={post.id}>{post.name}</div>
                ))}
            </div>
        </main>
    );
}
