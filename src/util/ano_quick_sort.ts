import { AnoError } from "./ano_error";

export function quick_sort<T>(
    arr: T[],
    comp: (a: T, b: T) => number,
): AnoError | void {
    try {
        qs_range(arr, 0, arr.length, comp);
    } catch {
        return new AnoError("arr contain undefined");
    }
}

function qs_range<T>(
    arr: T[],
    start: number,
    end: number,
    comp: (a: T, b: T) => number,
) {
    if (end - start <= 1) {
        return;
    }

    let front = start;
    let back = end - 1;

    while (front < back) {
        if (comp(arr[front]!, arr[front + 1]!) < 0) {
            swap(arr, front + 1, back);
            back = back - 1;
        } else {
            swap(arr, front, front + 1);
            front = front + 1;
        }
    }

    qs_range(arr, start, front, comp);
    qs_range(arr, front + 1, end, comp);
}

function swap(arr: any[], a: number, b: number) {
    const t = arr[a];
    arr[a] = arr[b];
    arr[b] = t;
}
