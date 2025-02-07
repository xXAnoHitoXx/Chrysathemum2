import { ServerQuery } from "~/server/server_query";
import { EarningEntry, EarningEntryID } from "../type_def";
import { retrieve_earnings_information_of_date } from "./salon";

export const retrieve_tech_earnings_information_of_date: ServerQuery<
    EarningEntryID,
    EarningEntry
> = ServerQuery.from_builder(({ salon, date, id }) => {
    return ServerQuery.create_query((_: EarningEntryID) => {
        return { salon: salon, date: date };
    })
        .chain(retrieve_earnings_information_of_date)
        .chain<EarningEntry | undefined>(
            (earnings) => earnings.filter((earning) => earning.id === id)[0],
        )
        .chain<EarningEntry>((earning) => {
            if (earning === undefined) {
                return {
                    id: id,
                    account: {
                        amount: 0,
                        tip: 0,
                    },
                    closing: {
                        machine: 0,
                        cash: 0,
                        gift: 0,
                        discount: 0,
                    },
                };
            } else {
                return earning;
            }
        });
});
