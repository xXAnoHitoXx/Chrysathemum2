"use client";

export default function SalonLeftNav(props: {is_admin: boolean}) {
    return (
        <div className="flex w-1/6 h-grow border-r-4 border-r-sky-500 justify-center min-w-52">
            <div className="grid grid-cols-1 w-3/4 h-fit justify-start p-5">
                <button className="border-2 border-b border-sky-400 rounded-t-3xl w-full h-20">Book Appoinment</button>
                <button className="border-x-2 border-y border-sky-400 w-full h-20">Sale</button>
                <button className="border-x-2 border-y border-sky-400 w-full h-20">Customer Finder</button>
                <button className="border-2 border-t border-sky-400 rounded-b-3xl w-full h-20">Redeem Gift Card</button>
                {AdminTasks(props.is_admin)}
            </div>
        </div>
    );
}

function AdminTasks(is_admin: boolean) {
    if (is_admin) {
        return(
            <div className="mt-10">
                <button className="border-2 border-b border-sky-400 rounded-t-3xl w-full h-20">Manage Technicians</button>
                <button className="border-x-2 border-y border-sky-400 w-full h-20">Daily Tally</button>
                <button className="border-x-2 border-y border-sky-400 w-full h-20">Weekly Tips</button>
                <button className="border-2 border-t border-sky-400 rounded-b-3xl w-full h-20">Monthly View</button>
            </div>
        );
    }

    return;
}
