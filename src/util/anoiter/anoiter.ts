export function ano_iter<T>(arr: T[]): AnoIter<T> {
    return new AnoIter(new ArrayIter(arr));
}

function normalize_input<T>(input: T[] | AnoIter<T>): AnoIterator<T> {
    if (input instanceof AnoIter) {
        return input.iter;
    } else {
        return new ArrayIter(input);
    }
}

export function ano_chain_iter<T>(...args: (T[] | AnoIter<T>)[]): AnoIter<T> {
    const iters: AnoIterator<T>[] = args.map(normalize_input);
    const chain: AnoIterator<T> = new ChainIter(iters);
    return new AnoIter(chain);
}

export function ano_zip<T, U>(a1: (T[] | AnoIter<T>), a2: (U[] | AnoIter<U>)): AnoIter<[T, U]> {
    const iter_1 = normalize_input(a1);
    const iter_2 = normalize_input(a2);
    return new AnoIter(new Zip2(iter_1, iter_2));
}

export function ano_cycle<T> (iter: AnoIterator<T>): AnoIterator<T> {
    return new CycleIter(iter);
}

export function ano_map<T, U> (mapper: (t: T) => U): IterOp<T, U> {
    return (t: AnoIterator<T>): AnoIterator<U> => {
        return new MapIter(t, mapper);
    }
}

export class AnoIter<T> {
    iter: AnoIterator<T>;
    constructor(iter: AnoIterator<T>){
        this.iter= iter;
    }

    bind<U>(iter_op: IterOp<T, U>): AnoIter<U> {
        return new AnoIter(iter_op(this.iter));
    }

    reduce<U>(reducer: (u: U, t: T) => U, initial_value: U): U {
        let u = initial_value;

        let item: T | END = this.iter.next();

        while (!(item instanceof END)) {
            u = reducer(u, item);
        }

        return u;
    }

    collect(): T[] {
        return this.reduce<T[]>((arr: T[], t: T) => { 
            arr.push(t); 
            return arr; 
        }, []);
    }
}

type IterOp<T, U> = (t: AnoIterator<T>) => AnoIterator<U>; 

class END {}

interface AnoIterator<T> {
    next(): T | END;
}

class MapIter<T, U> implements AnoIterator<U> {
    iter: AnoIterator<T>;
    mapper: (t: T) => U;

    constructor(iter: AnoIterator<T>, mapper: (t: T) => U) {
        this.iter = iter;
        this.mapper = mapper;
    }

    next(): U | END {
        const t = this.iter.next();
        if (t instanceof END) {
            return t;
        }

        return this.mapper(t);
    }
}

class Zip2<T, U> implements AnoIterator<[T, U]> {
    iter_1: AnoIterator<T>;
    iter_2: AnoIterator<U>;

    constructor(iter_1: AnoIterator<T>, iter_2: AnoIterator<U>) {
        this.iter_1 = iter_1;
        this.iter_2 = iter_2;
    }

    next(): [T, U] | END {
        const t = this.iter_1.next();
        const u = this.iter_2.next();

        if (t instanceof END || u instanceof END) {
            return new END();
        } 

        return [t, u];
    }
}

class CycleIter<T> implements AnoIterator<T> {
    iter: AnoIterator<T>;
    history: T[];
    constructor(iter: AnoIterator<T>) {
        this.iter = iter;
        this.history = [];
    }

    next(): T | END {
        let item = this.iter.next();

        if (item instanceof END) {
            this.iter = new ArrayIter(this.history);
            this.history = [];

            item = this.iter.next();

            if (item instanceof END) {
                return item;
            }
        }

        this.history.push(item);
        return item;
    }

}

class ChainIter<T> implements AnoIterator<T> {
    iters: ArrayIter<AnoIterator<T>>;
    active: AnoIterator<T> | END;

    constructor(iters: AnoIterator<T>[]) {
        this.iters = new ArrayIter(iters);
        this.active = this.iters.next();
    }

    next(): T | END {
        if (this.active instanceof END) {
            return this.active;
        }

        let item: T | END = this.active.next();

        while (item instanceof END){
            this.active = this.iters.next();

            if (this.active instanceof END){
                return this.active;
            }

            item = this.active.next();
        }

        return item;
    }
}

class ArrayIter<T> implements AnoIterator<T> {
    arr: T[];
    i = 0;

    constructor(arr: T[]) {
        this.arr = arr;
    }

    next(): T | END {
        if (this.i >= this.arr.length) {
            return new END();
        }
        let item: T | undefined = this.arr[this.i++];
        while (item == undefined) {
            if (this.i >= this.arr.length) {
                return new END();
            }
            item = this.arr[this.i++];
        }
        return item;
    }
}
