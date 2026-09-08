# d'cufii Order App

A food and beverage ordering application for d'cufii, built with Next.js, Firebase, and Cloudinary.

## Tech Stack

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Firebase Firestore
- Cloudinary
- Vitest

## Prerequisites

Make sure the following are installed:

- Node.js 20 or newer
- npm
- Firebase CLI

Install the Firebase CLI:

```bash
npm install -g firebase-tools
```

## Installation

Clone the repository and install its dependencies:

```bash
git clone https://github.com/Dzulkifli30/dcufii-order-app.git
cd dcufii-order-app
npm install
```

Create an environment file from the example:

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

Fill in the variables in `.env` before starting the application.

## Firebase Configuration

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Create or select a Firebase project.
3. Enable Email/Password Authentication.
4. Create a Cloud Firestore database.
5. Create a Web App in Firebase Project Settings.
6. Copy the Firebase configuration values into `.env`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Connect the Firebase CLI to the project and deploy the Firestore rules:

```bash
firebase login
firebase use <firebase-project-id>
firebase deploy --only firestore:rules
```

The rules are stored in `firestore.rules`. Firebase Storage is not required; the application uses Firebase Authentication and Cloud Firestore.

## Cloudinary Configuration

1. Create an account at [Cloudinary](https://cloudinary.com/).
2. Open **Product Environment Credentials**.
3. Add the following values to `.env`:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Do not use the `NEXT_PUBLIC_` prefix for Cloudinary variables. `CLOUDINARY_API_SECRET` is a server-side secret and must never be committed to GitHub.

Menu images are uploaded to the `dcufii/menu` folder in Cloudinary. The maximum image size is 5 MB.

## Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

Create and run a production build:

```bash
npm run build
npm start
```

## Running Tests

```bash
npm test
```

## Features

- Menu browsing
- Shopping cart and item notes
- QRIS, bank transfer, and cash payments
- Cash payment confirmation by cashier
- Admin menu management
- Cloudinary menu image uploads
- Menu stock management
- Admin and cashier dashboards
- Order status management through Firestore

## Security

Never commit environment files or local build output:

```text
.env
.env.*
.next/
node_modules/
.kiro/
.firebase/
.vercel/
```

`.env.example` contains placeholders only and is safe to publish. If a Cloudinary credential has been exposed, regenerate the Cloudinary API secret before publishing the repository.

## Project Structure

```text
app/           Next.js pages and API routes
components/    Reusable UI components
context/       React context and state management
data/          Fallback menu data
lib/           Firebase, Cloudinary, order services, and utilities
public/        Local image assets
types/         TypeScript types
__tests__/     Unit, property, and integration tests
```

## License

This project was created for the d'cufii ordering application.
