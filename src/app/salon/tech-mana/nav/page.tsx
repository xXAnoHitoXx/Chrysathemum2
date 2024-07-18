export default async function Nav() {
    return (
        <div className="flex h-fit w-full flex-wrap justify-center gap-2 p-4">
            <a href="/salon/tech-mana/new/">
                <button className="h-20 w-32 rounded-full border-2 border-sky-400">
                    New Technician
                </button>
            </a>
            <a href="/salon/tech-mana/assignment/">
                <button className="h-20 w-32 rounded-full border-2 border-sky-400">
                    Assignment
                </button>
            </a>
        </div>
    );
}
