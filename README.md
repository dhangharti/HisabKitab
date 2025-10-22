# RinMitra: Your Financial Companion

Welcome to RinMitra, a Next.js application designed to help you manage your finances, track loans, and gain insights into your debt repayment strategies. This application is built with a modern tech stack including Next.js, React, TypeScript, Tailwind CSS, ShadCN for UI components, and Firebase for backend services.

## Core Features

- **User Authentication**: Secure sign-up and login functionality using Firebase Authentication. Sessions are managed per-tab for enhanced security.
- **Financial Dashboard**: A centralized view of your income, expenses, investments, and wants.
- **Budgeting System**: Implements a 50/40/10 rule (Needs/Investments/Wants) which can be customized.
- **Loan Management**: Add, track, and manage multiple loans. The application automatically calculates EMI and amortization schedules.
- **Real-time Data Sync**: All your financial data is securely stored in Firestore and synchronized in real-time.
- **Responsive UI**: A clean, modern, and responsive user interface built with ShadCN and Tailwind CSS that works on both desktop and mobile.

---

## Code Structure and Flow

The application is built using the Next.js App Router. Here is a breakdown of the key directories and their purpose.

### 1. `src/app/` - Routing and Pages

This directory contains the main pages and layouts of the application.

- **`layout.tsx`**: The root layout for the entire application. It sets up the HTML structure, global styles, `ThemeProvider` for light/dark mode, and the core `FirebaseClientProvider`.
- **`page.tsx`**: The main dashboard page, visible after a user logs in. This is where all the financial components are assembled.
- **`login/page.tsx`**: The user sign-in page.
- **`signup/page.tsx`**: The user registration page.
- **`profile/page.tsx`**: Allows users to update their profile information.
- **`help/page.tsx`**: A simple FAQ page.
- **`subscription/page.tsx`**: A placeholder page for subscription plans.

### 2. `src/firebase/` - Firebase Integration

This directory is the heart of the backend integration.

- **`config.ts`**: Contains the public Firebase configuration object. This is client-safe.
- **`index.ts`**: The main entry point for Firebase initialization. It initializes the app and sets the authentication persistence to `session`.
- **`client-provider.tsx`**: A crucial, hydration-safe client component that ensures Firebase is initialized only in the browser. This prevents server-client mismatch errors on Vercel.
- **`provider.tsx`**: A React Context provider that supplies the Firebase app, auth, and firestore instances to the rest of the application. It also manages the user's authentication state.
- **`non-blocking-updates.ts`**: Contains functions (`setDocumentNonBlocking`, etc.) for writing data to Firestore without waiting for the operation to complete, keeping the UI fast and responsive.
- **`non-blocking-login.ts`**: Handles sign-in and sign-up calls without `await`, letting Firebase's auth state listener manage the UI updates.

### 3. `src/components/` - UI Components

This directory contains all the reusable React components.

- **`dashboard/`**: Components specific to the financial dashboard, like `LoanCard`, `BudgetCategory`, and `Header`.
- **`ui/`**: Core UI components from the ShadCN library, such as `Button`, `Card`, and `Input`.
- **`sidebar-new.tsx`**: The main sidebar component, which is also hydration-safe to work correctly on mobile and desktop.
- **`AppSidebar.tsx`**: The content and navigation links for the sidebar.

### 4. `src/lib/` - Types, Constants, and Utilities

This directory holds shared logic and definitions.

- **`types.ts`**: Contains all TypeScript type definitions for data structures like `Loan`, `Income`, etc.
- **`constants.ts`**: Defines constant values used throughout the app, like initial data structures and date constants.
- **`loan-calculations.ts`**: Pure functions for financial calculations, such as EMI and amortization schedules.
- **`utils.ts`**: Utility functions, most notably `cn` for combining Tailwind CSS classes.

---

## Data and Authentication Flowchart (Text-Based)

This flowchart describes the journey from a user visiting the site to interacting with their data.

`[User Visits App]`
       `|`
       `v`
`[Next.js Server Renders Initial Page (e.g., /login)]`
       `|`
       `v`
`[HTML is sent to Browser]`
       `|`
       `v`
`[Browser Loads HTML & JavaScript]`
       `|`
       `v`
`[1. FirebaseClientProvider (client-only)]`
   `- Safely initializes Firebase using `initializeFirebase()` from `firebase/index.ts`.`
   `- `setPersistence` is set to 'session'.`
   `- Renders its children ONLY AFTER initialization is complete.`
       `|`
       `v`
`[2. FirebaseProvider]`
   `- Subscribes to Firebase auth state changes (`onAuthStateChanged`).`
   `- Initially, `user` is null, `isUserLoading` is true.`
       `|`
       `v`
`[3. Page Loads (e.g., /login or /)]`
   `- The page uses the `useFirebase()` hook to get auth state.`
   `- **If `isUserLoading` is true:**`
     `- The page shows a "Loading..." message.`
   `- **If `isUserLoading` is false AND `user` is null:**`
     `- The page redirects to `/login`.`
     `- User enters credentials on the `/login` page.`
     `- `initiateEmailSignIn()` is called (non-blocking).`
     `- `FirebaseProvider`'s `onAuthStateChanged` listener detects the new user.`
     `- `user` state is updated, triggering a re-render.`
   `- **If `isUserLoading` is false AND `user` is not null:**`
     `- The `/` (Dashboard) page proceeds.`
     `- It fetches the user's financial data from Firestore (`/user_data/{user.uid}`).`
     `- The dashboard is displayed with the user's data.`
       `|`
       `v`
`[User Interacts with Dashboard (e.g., adds income)]`
   `- An action (e.g., `addIncome`) is called in `page.tsx`.`
   `- The `saveData` function updates the local React state immediately.`
   `- `setDocumentNonBlocking()` is called to save the updated data to Firestore in the background.`
   `- The UI feels instant, and the data is securely persisted in the database.`

This corrected structure and flow should provide a stable, functional, and secure experience for your users.
