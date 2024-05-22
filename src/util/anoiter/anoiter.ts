import { chain, ifilter, imap, iter, map } from "itertools";

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

    collect(): T[] {
        return map(this.data, (t: T) => (t));
    }
}
