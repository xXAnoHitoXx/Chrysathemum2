export default async function Nav() {
    return(
        <div className="flex flex-wrap w-full h-fit p-4 gap-2 justify-center">
            <a href="/salon/tech-mana/new/">
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">New Technician</button>
            </a>
            <a href="/salon/tech-mana/assignment/">
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Assignment</button>
            </a>
        </div>
    );
}
