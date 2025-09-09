# Express + JWT Authentication (TypeScript)

A boilerplate project for building a REST API with **Express**,
**TypeScript**, and **JWT authentication**.

## Features

-   🚀 Express.js for building REST APIs\
-   🔐 JWT (JSON Web Tokens) for authentication & authorization\
-   📝 TypeScript with type safety\
-   ⚡ Middleware for request validation\
-   🗂️ Project structure for scalability

------------------------------------------------------------------------

## Getting Started

### 1. Clone the repo

``` bash
git clone https://github.com/your-username/express-jwt-typescript.git
cd express-jwt-typescript
```

### 2. Install dependencies

``` bash
npm install
```

### 3. Setup environment variables

Create a `.env` file in the root of the project:

``` env
PORT=5000
JWT_SECRET=your_secret_key
TOKEN_EXPIRES_IN=1h
```

### 4. Run the development server

``` bash
npm run dev
```

### 5. Build for production

``` bash
npm run build
npm start
```

------------------------------------------------------------------------

## Project Structure

    src/
    ├── controllers/      # Route handlers
    ├── middlewares/      # Auth & error middlewares
    ├── routes/           # API routes
    ├── services/         # Business logic
    ├── types/            # TypeScript types
    ├── utils/            # Helper functions
    ├── index.ts          # App entry point

------------------------------------------------------------------------

## Example Routes

### Register a User

``` http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

### Login

``` http
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

*Response:*

``` json
{
  "token": "your_jwt_token"
}
```

### Protected Route

``` http
GET /api/profile
Authorization: Bearer <token>
```

------------------------------------------------------------------------

## Scripts

-   `npm run dev` → Run in dev mode with nodemon & ts-node\
-   `npm run build` → Build TypeScript into JavaScript (`dist/`)\
-   `npm start` → Run compiled JavaScript in production

------------------------------------------------------------------------

## Tech Stack

-   [Express](https://expressjs.com/)\
-   [TypeScript](https://www.typescriptlang.org/)\
-   [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)\
-   [dotenv](https://github.com/motdotla/dotenv)

------------------------------------------------------------------------

## License

MIT © Sahil Shrestha
