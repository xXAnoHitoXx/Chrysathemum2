import { DataError, is_data_error } from "./data_error";

export type Query<T, U> = (t: T) => Promise<U | DataError> | U | DataError;

export abstract class QueryData<T> {
    static pack<T>(t: T): QueryData<T> {
        return new Raw(t);
    }

    bind<U>(m: Query<T, U>): QueryData<U> {
        return new Mapped(this, m);
    }

    abstract unpack(): Promise<T | DataError>;
}

class Raw<T> extends QueryData<T> {
    private t: T;
    constructor(t: T) {
        super();
        this.t = t;
    }

    async unpack(): Promise<T> {
        return this.t;
    }
}

class Mapped<T, U> extends QueryData<U> {
    private t: QueryData<T>;
    private m: Query<T, U>;

    constructor(t: QueryData<T>, m: Query<T, U>) {
        super();
        this.t = t;
        this.m = m;
    }

    async unpack(): Promise<U | DataError> {
        const t = await this.t.unpack();
        return is_data_error(t) ? t : this.m(t);
    }
}
