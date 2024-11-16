import { Input } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { LastCustomerSave } from "../customer_search";

enum State {
    LastCustomer = "Last Customer",
    NameSearch = "Name Search",
    PhoneSearch = "Phone Search",
}

enum Status {
    Valid = "",
    InvalidPhone = ": Invalid Phone Number",
    InvalidName = ": Invalid Name",
}

export function SearchQueryInput(props: {
    save: LastCustomerSave;
    search_phone_number: (phone: string) => void;
    search_name: (name: string) => void;
    last_customer: () => void;
}) {
    const [input, set_input] = useState("");
    const [search_state, set_state] = useState<string>(
        props.save.data === null ? State.NameSearch : State.LastCustomer,
    );
    const [query_status, set_status] = useState<string>(
        props.save.data === null ? Status.InvalidName : Status.Valid,
    );

    useEffect(() => {
        if (input === "") {
            if (props.save.data != null) {
                set_state(State.LastCustomer);
                set_status(Status.Valid);
            } else {
                set_state(State.NameSearch);
                set_status(Status.InvalidName);
            }
            return;
        }

        const num = parseInt(
            input
                .replaceAll("-", "")
                .replaceAll(" ", "")
                .replaceAll(")", "")
                .replaceAll("(", ""),
            10,
        );

        if (isNaN(num) || input.includes(".")) {
            // name
            set_state(State.NameSearch);
            if (input.includes("/") || input.includes("\\")) {
                set_status(Status.InvalidName);
            } else {
                set_status(Status.Valid);
            }
        } else {
            // phone
            set_state(State.PhoneSearch);
            const phone_number = num.toString();
            if (phone_number.length === 10) {
                set_status(Status.Valid);
            } else {
                set_status(Status.InvalidPhone);
            }
        }
    }, [input]);

    return (
        <div className="flex w-full flex-col gap-1">
            <div className="flex w-full items-center gap-1 border-b-1 border-t-1 border-b-sky-900 border-t-sky-900 p-2">
                <Input
                    label="name / phone number"
                    value={input}
                    onValueChange={set_input}
                />
            </div>
            <div className="flex w-full p-2">
                <button
                    className={
                        "h-20 w-32 border-1" +
                        " " +
                        (query_status === Status.Valid
                            ? "rounded-3xl border-sky-900"
                            : "border-red-400")
                    }
                    onClick={() => {
                        switch (search_state) {
                            case State.LastCustomer:
                                props.last_customer();
                                break;
                            case State.NameSearch:
                                props.search_name(input);
                                break;
                            case State.PhoneSearch:
                                props.search_phone_number(input);
                                break;
                        }
                    }}
                >
                    {search_state === State.LastCustomer
                        ? search_state + ": " + props.save.data!.name
                        : search_state + query_status}
                </button>
            </div>
        </div>
    );
}
