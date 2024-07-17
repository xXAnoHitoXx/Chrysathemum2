# Chrysanthemum 2

## Todo

- [x] ~~make it deploy~~
- [x] ~~set up db~~
- [x] ~~add auth~~
- [x] ~~error management~~
- [x] ~~data layout~~
- back end:
    - [ ] cruds
        - [x] ~~customer~~
            - [x] ~~customer data type~~
            - [x] ~~customer entries~~
            - [x] ~~customer phone index~~
            - [x] ~~customer migration index~~
        - [x] ~~technician~~
            - [x] ~~technician entries~~
            - [x] ~~technician login index~~
            - [x] ~~technician migration index~~
            - [ ] sale tech
        - [x] ~~location~~
            - [x] ~~location entries~~
            - [x] ~~location's technician~~
        - [ ] appointment & transactions
            - [x] ~~appointment entries~~
            - [x] ~~transaction entries~~
            - [ ] transaction migration index
        - [ ] accounting
            - [ ] entries
            - [ ] closing
            
- salon:
    - [x] ~~technician manager~~
        - [x] ~~create technician~~
        - [x] ~~assign technician to salon location~~
        - [x] ~~set technician inactive~~
    - [ ] migration framework
        - restriction: vercel limited timeout on development
        - [x] ~~runable from dev environment~~
        - [x] ~~migrating customers~~
        - [ ] migrating transactions
    - [ ] appointment viewer
        - [x] ~~display board~~
    - [ ] booking
    - [ ] view daily breakdown
    - [ ] sumary
    - [ ] month tally
- technician:
    - [ ] daily break down
    - [ ] sumary
- [ ] curtomer booking



# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
