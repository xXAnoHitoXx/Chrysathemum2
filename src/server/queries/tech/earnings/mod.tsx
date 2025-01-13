import { retrieve_earnings_information_of_date } from "../../salon/earnings/mod";
import { EntityAccount } from "../../salon/earnings/types";
import { pack_nested, Query } from "../../server_queries_monad";

export const retrieve_tech_earnings_information_of_date: Query<
    { salon: string; date: string; tech_id: string },
    EntityAccount[]
> = ({ salon, date, tech_id }, f_db) => {
    return pack_nested({ salon, date }, f_db)
        .bind(retrieve_earnings_information_of_date)
        .bind((earnings) => {
            return earnings.filter((earning) => earning.id === tech_id);
        })
        .unpack();
};
