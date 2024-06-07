import { chain, chunked, icompact, ifilter, imap, iter, map, reduce } from "itertools";

export function ano_iter<T>(data: Iterable<T>): AnoIter<T> {
    return new AnoIter<T>(iter(data));
}

export function ano_chain_iter<T>(...data: (Iterable<T> | AnoIter<T>)[]): AnoIter<T> {
    return new AnoIter<T>(chain(...data.map((data) => {
        if (data instanceof AnoIter) {
            return data.data;
        } else {
            return iter(data);
        }
    })));
}

export class AnoIter<T> {
    data: IterableIterator<T>;
    constructor(data: IterableIterator<T>) {
        this.data = data;
    }

    ifilter(predicate: (item: T) => boolean): AnoIter<T> {
        return new AnoIter<T>(ifilter(this.data, predicate));
    }

    map<U>(mapper: (item: T) => U): U[] {
        return map(this.data, mapper);
    } 

    imap<U>(mapper: (item: T) => U): AnoIter<U> {
        return new AnoIter(imap(this.data, mapper));
    }

    icompact<U>(mapper: (item: T) => (U | null | undefined) = (t_item) => (t_item as (U | null | undefined))): AnoIter<U> {
        return new AnoIter(icompact(imap(this.data, mapper)));
    }

    ichunk(size: number): AnoIter<T[]> {
        return new AnoIter(chunked(this.data, size));
    }

    reduce<U>(reducer: (u: U, t: T) => U, initial_value: U): U {
        return reduce(this.data, reducer, initial_value);
    }

    collect(): T[] {
        return map(this.data, (t: T) => (t));
    }
}
