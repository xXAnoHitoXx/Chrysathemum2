import { currentUser } from "@clerk/nextjs/server";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex w-full flex-grow justify-start min-h-lvh">
            <SalonLeftNav/>
            {children}
        </div>
    );
}

function SalonLeftNav() {
    return (
        <div className="flex w-1/6 h-grow border-r-4 border-r-sky-500 justify-center min-w-52">
            <div className="grid grid-cols-1 w-3/4 h-fit justify-start p-5">
                <button className="border-2 border-sky-400 rounded-t-3xl w-full h-20">Book Appoinment</button>
                <button className="border-2 border-sky-400 w-full h-20">Sale</button>
                <button className="border-2 border-sky-400 w-full h-20">Customer Finder</button>
                <button className="border-2 border-sky-400 rounded rounded-b-3xl w-full h-20">Redeem Gift Card</button>
                <AdminTasks/>
            </div>
        </div>
    );
}

async function AdminTasks() {
    const user = await currentUser();

    if (user && user.publicMetadata.Role === "admin") {
        return(
            <div className="mt-10">
                <button className="border-2 border-sky-400 rounded-t-3xl w-full h-20">Manage Technicians</button>
                <button className="border-2 border-sky-400 w-full h-20">Daily Tally</button>
                <button className="border-2 border-sky-400 w-full h-20">Weekly Tips</button>
                <button className="border-2 border-sky-400 rounded rounded-b-3xl w-full h-20">Monthly View</button>
            </div>
        );
    }

    return;
}
