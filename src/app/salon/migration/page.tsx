export default async function MigrationStation() {
    return(
        <div>
            <div className="flex flex-wrap w-full h-fit p-4 gap-2 justify-center">
                <a href="/salon/migration/sequence">
                    <button className="border-2 border-sky-400 rounded-full w-32 h-20">Initiate Migration Sequence</button>
                </a>
            </div>
        </div>
    );
}

