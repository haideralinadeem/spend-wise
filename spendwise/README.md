# SpendWise

A personal finance manager built with React, TypeScript and Supabase. Track income and expenses in PKR, set budgets, work towards savings goals, and see where your money goes with charts and rule-based insights.

> Screenshots: add images to `docs/` and link them below.
>
> | Dashboard | Transactions | Budgets |
> |---|---|---|
> | _placeholder_ | _placeholder_ | _placeholder_ |

## Features

- **Accounts:** register, sign in, sign out, forgot and reset password, protected pages, persistent sessions.
- **Dashboard:** balance, income, expense and savings cards, an income-vs-expenses chart (7 days to 12 months), a spending donut chart, recent transactions, budget overview and insights.
- **Transactions:** add, edit, delete, view details, search, filter (type, category, payment method, dates), sort and paginate.
- **Budgets:** a total monthly budget and per-category budgets, with progress bars and four warning levels (under 70%, 70-89%, 90-99%, 100%+).
- **Savings goals:** targets with deadlines, progress bars and "add money".
- **Analytics:** trends, category and payment-method breakdowns, average daily spending, monthly comparison, CSV export and a PDF report.
- **Calendar:** income and expenses on each day, with a daily detail panel.
- **Insights:** plain rule-based calculations on your own data. They are not AI, and the app says so.
- **Settings:** profile picture, currency, date format, theme, default monthly budget, change password, delete account.
- **Demo data:** optional, clearly marked, removable in one click.
- Light and dark mode, fully responsive.

## Technologies

React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide icons, React Router (HashRouter), jsPDF, Supabase (PostgreSQL, Auth, Row Level Security), GitHub Actions and GitHub Pages.

## Database architecture

| Table | Purpose |
|---|---|
| `profiles` | One row per user: name, email, avatar, currency, date format, default budget. Created automatically at sign-up by a database trigger. |
| `transactions` | Income and expenses. `amount` is `numeric(14,2)` (never floating point) and must be above zero. |
| `budgets` | One budget per user, category, month and year. The category `Overall` is the total monthly budget. |
| `savings_goals` | Target amount, saved amount and optional target date. |

Every table has Row Level Security enabled, so a signed-in user can only read and change their own rows. Only the public (publishable/anon) key is used in the browser. The service-role key is never used.

## Run it on your computer

1. Install Node.js (LTS) from nodejs.org.
2. Create a free project at supabase.com.
3. In the Supabase **SQL Editor**, paste and run `supabase/setup_all.sql`.
4. In Supabase go to **Authentication, Sign In / Providers, Email** and switch **Confirm email** off while testing.
5. Copy `.env.example` to `.env`. Fill in `VITE_SUPABASE_URL` (Project URL, ending in `.supabase.co`) and `VITE_SUPABASE_ANON_KEY` (the publishable key from Project Settings, API Keys).
6. In a terminal inside this folder run:
   ```
   npm install
   npm run dev
   ```
7. Open the address it prints (usually http://localhost:5173).

Useful checks: `npm run typecheck` and `npm run build`.

## Put it on GitHub and publish it

1. Create an empty repository on github.com (no README, no .gitignore). Note its name, for example `spendwise`.
2. In your project folder run:
   ```
   git init
   git add .
   git commit -m "SpendWise"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/spendwise.git
   git push -u origin main
   ```
   `.env` is listed in `.gitignore`, so your keys are not uploaded. Do commit `package-lock.json`.
3. On GitHub open **Settings, Pages** and set **Source** to **GitHub Actions**.
4. Open **Settings, Secrets and variables, Actions, New repository secret**. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same values as in your `.env`.
5. Open the **Actions** tab. The "Deploy to GitHub Pages" workflow runs on every push to `main`. When it turns green, your site is at `https://YOUR-USERNAME.github.io/spendwise/`.
6. Tell Supabase about the website. Go to **Authentication, URL Configuration**:
   - **Site URL:** `https://YOUR-USERNAME.github.io/spendwise/`
   - **Redirect URLs:** add `https://YOUR-USERNAME.github.io/spendwise/**` and `http://localhost:5173/**`

   Without this, password-reset and confirmation emails will not return to the right page.
7. Before sharing the site publicly, switch **Confirm email** back on.

If your repository is named `YOUR-USERNAME.github.io`, set `VITE_BASE_PATH` to `/` in `.github/workflows/deploy.yml`.

## Manual test checklist

- Register, sign out, sign in. Request a password reset and finish it from the email.
- Add, edit and delete a transaction. Try an amount of 0 (it must be refused).
- Search, filter, sort and page through transactions.
- Create a total budget and a category budget. Spend past 70%, 90% and 100% and check the labels.
- Create a goal, add money, edit it, delete it.
- Open Analytics, change the period, export CSV and PDF.
- Click days on the Calendar.
- Change currency, date format and theme in Settings.
- Add demo data, then remove it.
- Sign in as a second user and confirm you cannot see the first user's data.
- Resize the window to phone width and use every page.

## Known limits

- Changing the currency changes the display only. Amounts are not converted.
- The PDF report uses a built-in font that supports basic Latin characters only. Other characters print as `?`.
- Insights are rule-based on purpose. The code is structured (`src/utils/insights.ts`) so a real AI service can be added later.

## Future improvements

Recurring transactions, receipt uploads with Supabase Storage, multi-currency conversion, shared household accounts, bank statement import, and an AI assistant behind a server-side function.
