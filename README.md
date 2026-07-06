# IndiaForms Centre

Full-stack e-commerce-style catalogue site with an admin inventory panel.

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** Python FastAPI, deployed as a single Vercel serverless function (`/api/index.py`)
- **Database:** PostgreSQL (Neon or Supabase recommended — Vercel functions are stateless, so SQLite will not persist)
- **Auth:** JWT-based admin login (bcrypt-hashed passwords)

## Folder structure

```
indiaformscentre/
├── api/
│   ├── index.py          # FastAPI app — ALL backend routes live here
│   └── seed.py            # run once locally to create your first admin user
├── app/                    # Next.js App Router pages
│   ├── layout.tsx
│   ├── page.tsx            # home page
│   ├── globals.css
│   ├── shop/
│   │   ├── page.tsx        # product listing + category filter
│   │   └── [slug]/page.tsx # product detail
│   └── admin/
│       ├── login/page.tsx
│       └── dashboard/page.tsx  # add/edit products, update stock, toggle visibility
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   └── ProductCard.tsx
├── lib/
│   └── api.ts               # frontend fetch helpers
├── requirements.txt          # Python deps (Vercel installs these for /api)
├── package.json              # Node deps for Next.js
├── vercel.json                # routes /api/* to the FastAPI function
├── .env.example
└── .gitignore
```

## 1. Local setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- A free Postgres database — [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com) both work in seconds

### Clone and install

```bash
git clone https://github.com/indiaforms/indiaformscentre.git
cd indiaformscentre

# Frontend deps
npm install

# Backend deps (use a virtualenv)
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=some-long-random-string
```

For local backend testing you can also just leave `DATABASE_URL` unset — it falls back to a local SQLite file.

### Create your first admin login + sample categories

```bash
export DATABASE_URL=postgresql://...   # same value as above, or skip for SQLite
python api/seed.py
```
This prompts you for an admin username/password and creates 5 starter categories (Lifestyle, Travel, Office Essentials, Gadgets, Eco Life).

### Run the backend locally

```bash
pip install "uvicorn[standard]"
uvicorn api.index:app --reload --port 8000
```
Visit `http://localhost:8000/api/health` — should return `{"status": "ok"}`.

### Run the frontend locally

In a second terminal:
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" >> .env.local
npm run dev
```
Visit `http://localhost:3000`.

## 2. Push to GitHub

```bash
git add .
git commit -m "Initial full-stack scaffold: storefront + admin inventory panel"
git push origin main
```

## 3. Deploy to Vercel

### Option A — Vercel CLI
```bash
npm install -g vercel
vercel login
vercel            # first deploy, follow prompts (link to indiaformscentre repo/project)
```

### Option B — Vercel Dashboard
1. Go to vercel.com → **Add New Project** → import `indiaforms/indiaformscentre`
2. Framework preset: Next.js (auto-detected). Vercel will also auto-detect the Python files under `/api` and deploy them as serverless functions using `requirements.txt`.
3. Add environment variables under **Project Settings → Environment Variables**:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_API_URL` → leave **empty** (frontend and backend share the same domain in production, so relative `/api/...` calls just work)
4. Click **Deploy**.

### After first deploy — seed your production database
Run this from your machine, pointed at the **production** `DATABASE_URL**:
```bash
export DATABASE_URL="<your production postgres URL>"
python api/seed.py
```

Then log in at `https://<your-vercel-domain>/admin/login`.

## 4. How the inventory logic works

- Every product has a `quantity` and `is_visible` flag.
- Setting `quantity` to `0` in the admin dashboard automatically flips the product's public `stock_status` to `out_of_stock`, which renders a **"Sold Out"** badge on the storefront (product image is grayscaled and the buy button is disabled) — no separate toggle needed.
- `is_visible = false` fully hides a product from public `/api/products` and `/api/products/{slug}` responses, even if it's in stock — use this for drafts or products you're not ready to sell yet.
- Products are tagged to a `category`, and the shop page filters by category slug (`/shop?category=travel`).

## 5. Product images

Vercel serverless functions can't store uploaded files permanently. Two easy options:
1. **Cloudinary free tier** — upload images there, paste the resulting URL into the admin "Image URL" field.
2. **Vercel Blob** — if you want in-app uploads, add `@vercel/blob` to the frontend and a small upload endpoint; ask me and I'll wire this in.

## 6. Next steps you may want
- Real checkout / payments (Razorpay is the standard choice for India)
- Product image galleries (multiple images per product)
- Order management in the admin dashboard
- Email notifications on low stock

Let me know which of these you want built next and I'll add it directly into this scaffold.
