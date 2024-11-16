import { pairwise } from "itertools";
import { bubble_sort } from "./ano_bubble_sort";
import { quick_sort } from "./ano_quick_sort";

test("bubble sort", async () => {
    const arr = [5, 1, 2, 4, 3, 2];
    bubble_sort(arr, (a, b) => a - b);

    for (let [a, b] of pairwise(arr)) {
        expect(a).toBeLessThanOrEqual(b);
    }
});

test("quick sort", async () => {
    const arr = [5, 1, 2, 4, 3, 2];
    quick_sort(arr, (a, b) => a - b);

    for (let [a, b] of pairwise(arr)) {
        expect(a).toBeLessThanOrEqual(b);
    }
});
