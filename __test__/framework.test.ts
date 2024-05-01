test("test", () => {
    expect(true).toBe(true);
});

test("test ENV", () => {
    expect(process.env.NODE_ENV).toBe("test");
});
