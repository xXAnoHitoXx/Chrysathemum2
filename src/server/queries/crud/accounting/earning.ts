import { Query } from "../../server_queries_monad";

export const register_earnings: Query<
    {
        entity: string;
        amount: number;
        tip: number;
    },
    void
> = async ({ entity, amount, tip }, f_db) => {};
