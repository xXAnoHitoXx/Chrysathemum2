test("test", () => {
    expect(true).toBe(true);
});

test("test ENV", () => {
    console.log(process.env.VERCEL_ENV)
    expect(process.env.NODE_ENV).toBe("test");
});


