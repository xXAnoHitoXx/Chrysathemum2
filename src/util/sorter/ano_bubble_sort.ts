import { AnoError } from "./ano_error";

export function bubble_sort<T>(
    arr: T[],
    comp: (a: T, b: T) => number,
): AnoError | void {
    try {
        let sorted = false;
        while (!sorted) {
            sorted = true;
            for (let i = 1; i < arr.length; i++) {
                if (comp(arr[i - 1]!, arr[i]!) > 0) {
                    sorted = false;
                    swap(arr, i - 1, i);
                }
            }
        }
    } catch {
        return new AnoError("arr contain undefined");
    }
}

function swap(arr: any[], a: number, b: number) {
    const t = arr[a];
    arr[a] = arr[b];
    arr[b] = t;
}
