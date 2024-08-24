import { ano_iter } from "./anoiter";

test("icompact test", () => {
    const arr: (number | undefined)[] = [1, 12, undefined, 164, undefined, 420];
    const compacted: number[] = ano_iter(arr).icompact<number>().collect();
    expect(compacted).toEqual([1, 12, 164, 420]);
});
