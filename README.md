# Grameen Business Advisor — SIH26091

AI-driven hyper-local business advisory & financial structuring assistant for rural
micro-entrepreneurs. No login/signup — straight to the dashboard.

## What's included

- `/dashboard` — stat cards, feasibility overview, quick actions (matches your screenshot)
- `/advisor` — 4-step input form (location → business info → financial details → review)
- `/report` — full AI Business Advisory Report with tabs (Overview, Market, Financial, Schemes, Risks, Recommendations)
- `/financial-planner` — editable investment/expense/revenue calculator with live P&L
- `/schemes` — government scheme cards (PMEGP, DEDS, Stand Up India, Mudra)
- `lib/financialEngine.ts` — pure deterministic scheme-matching + EMI calculator (zero AI, always correct)
- `lib/ai.ts` — Groq call that generates the structured feasibility report
- `lib/bhashini.ts` — Bhashini translation stub (works with fallback until you add credentials)
- `lib/BusinessContext.tsx` — shared state so Advisor form → Report → Dashboard all see the same data

## Setup (exact commands)

1. Extract this zip into a folder, then open a terminal inside that folder.

2. Install dependencies:
   ```
   npm install
   ```

3. Copy the environment file and add your Groq API key:
   ```
   cp .env.example .env.local
   ```
   Open `.env.local` and paste your Groq API key after `GROQ_API_KEY=`
   (Get one free at https://console.groq.com/keys)

4. Run the app locally:
   ```
   npm run dev
   ```
   Open http://localhost:3000 — it will redirect straight to the dashboard.

## Deploying (Vercel, same as Xi-One)

```
git init
git add .
git commit -m "Initial commit — Grameen Business Advisor"
git remote add origin <your-new-github-repo-url>
git push -u origin main
```
Then import the repo on vercel.com, add `GROQ_API_KEY` under Project → Settings →
Environment Variables, and deploy.

## Bhashini setup (do this on Day 2, not urgent for Day 1)

The app works fully without Bhashini credentials — `lib/bhashini.ts` has a safe fallback
that just returns the original text if no API key is set, so nothing breaks.

To wire in real multilingual support before your demo:
1. Register at https://bhashini.gov.in/ubhasini/en/signup
2. Get your User ID + Ulca API Key
3. Add both to `.env.local`:
   ```
   BHASHINI_USER_ID=your_user_id
   BHASHINI_API_KEY=your_ulca_api_key
   ```
4. That's it — `translateText()` in `lib/bhashini.ts` will start using the real API automatically.

## Build order (matches the MVP plan)

1. `lib/financialEngine.ts` — already done, test it standalone first if you want to verify
2. `lib/ai.ts` + `/api/analyze` — test with 4-5 sample inputs, check the JSON comes back clean
3. `/advisor` form — should already work end-to-end once step 2 is confirmed working
4. `/report`, `/dashboard`, `/financial-planner`, `/schemes` — all wired, should just work
5. Bhashini — Day 2, optional polish
6. Visual tweaks to match your exact screenshot colors/spacing if anything looks off

## Notes

- No authentication anywhere — as requested, this is fully open, no login/signup flow.
- All data lives in React Context (`BusinessContext.tsx`) — refreshing the page will reset
  it since nothing is persisted to a database. If you want plan history to survive a refresh,
  the next step would be wiring Firebase Firestore the same way XOS does it — say the word
  and it can be added.
- The financial numbers (EMI, scheme match, project cost) are 100% deterministic math — never
  AI-generated — so they can never be wrong in front of judges.
