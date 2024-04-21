import { currentUser } from "@clerk/nextjs/server";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex w-full h-dvh justify-start">
            <SalonLeftNav/>
            {children}
        </div>
    );
}

function SalonLeftNav() {
    return (
        <div className="grid grid-cols-1 w-1/6 h-dvh justify-start">
            <button>Book Appoinment</button>
            <button>Sale</button>
            <button>Customer Finder</button>
            <button>Redeem Gift Card</button>
            <AdminTasks/>
        </div>
    );
}

async function AdminTasks() {
    const user = await currentUser();

    if (user && user.publicMetadata.Role === "admin") {
        return(
            <button>Administration</button>
        );
    }

    return;
}
