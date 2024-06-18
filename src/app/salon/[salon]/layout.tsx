export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode,
    params: { salon: string }
}) {

    return (
        <div className="flex flex-wrap p-2 gap-2">
            <a href={"/salon/nav/".concat(params.salon)}>
                <button className="border-2 border-sky-400 rounded-full w-32 h-20">Actions</button>
            </a>
            <div id="Appointment View" className="flex flex-nowrap w-full h-fit overflow-x-scroll">
                {children}
            </div>
        </div>
    );
}
