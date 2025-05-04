This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Testing

We use Vitest for testing the Next.js frontend components. To run the tests:

```bash
# Run tests once
bun test

# Run tests in watch mode
bun run test:watch 

# Run tests with UI
bun run test:ui

# Run tests with coverage
bun run test:coverage
```

### Testing with the API Server

You can run the frontend with the test API server on port 4040:

```bash
# Run the test script
./run-test-api.sh
```

Alternatively, you can run both servers and tests with the root script:

```bash
# From the project root
../run-tests-and-start.sh
```

This script:
1. Runs tests for both the server and frontend
2. Starts the Elysia server on port 4040
3. Starts the Next.js frontend on port 3000
