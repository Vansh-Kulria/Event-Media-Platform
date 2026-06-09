# Deployment Guide - Event Media Platform

This guide outlines how to deploy the **Event Media Platform** (Backend, Frontend, and Database) to cloud hosting environments (non-localhost).

---

## 1. Database Setup (PostgreSQL)

You need a hosted PostgreSQL database. We recommend **Neon** or **Supabase** (both offer excellent free tiers).

### Option A: Neon (Recommended)
1. Go to [Neon.tech](https://neon.tech/) and sign up.
2. Create a new project named `event-media-platform`.
3. Copy your database connection string (looks like `postgresql://username:password@ep-XXXXXX.us-east-2.aws.neon.tech/neondb?sslmode=require`).
4. Keep this connection string ready to set as your `DATABASE_URL` environment variable.

---

## 2. Backend Deployment (Render)

Render is ideal for deploying Node.js/Express backends.

1. Push your codebase to a **GitHub** repository.
2. Sign up on [Render.com](https://render.com/).
3. Click **New** -> **Web Service**.
4. Connect your GitHub repository.
5. Set the following details:
   - **Name**: `event-media-backend`
   - **Language**: `Node`
   - **Build Command**: `npm install && npm run build` (inside the `backend` subfolder)
     * *Note: Set the Root Directory on Render to `backend`.*
   - **Start Command**: `npm start`
6. Click **Advanced** and add the following **Environment Variables**:
   - `DATABASE_URL`: *Your Neon connection string*
   - `JWT_SECRET`: *A secure random string (e.g. `supersecretkey`)*
   - `FRONTEND_URL`: `https://your-frontend-domain.vercel.app` *(update this after creating your Vercel deployment)*
   - `CLOUDINARY_CLOUD_NAME`: `dge99rtsq`
   - `CLOUDINARY_API_KEY`: `639614694264446`
   - `CLOUDINARY_API_SECRET`: `9rQ4u73T_wAaYLm52Iyy71EjUww`
7. Click **Deploy Web Service**. Render will build and deploy your Node.js backend. Once deployed, copy your backend URL (e.g. `https://event-media-backend.onrender.com`).

---

## 3. Frontend Deployment (Vercel)

Vercel is the native hosting platform for Next.js and is extremely easy to use.

1. Sign up on [Vercel.com](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Set the following details:
   - **Root Directory**: Select `frontend` from the dropdown list.
   - **Framework Preset**: `Next.js`
5. Expand the **Environment Variables** section and add:
   - `NEXT_PUBLIC_API_URL`: `https://event-media-backend.onrender.com/api` *(Your deployed Render backend URL with `/api` appended)*
6. Click **Deploy**. Vercel will optimize and host your Next.js application. Copy your frontend URL (e.g. `https://event-media-platform.vercel.app`) and update the `FRONTEND_URL` environment variable in your **Render backend dashboard** to match this URL.

---

## 4. Run Prisma Migrations on Production Database

Before utilizing the production backend, you need to push the database schema structures:
1. Temporarily replace the `DATABASE_URL` in your local `backend/.env` file with your **Neon production connection string**.
2. Run the migration command from your local terminal inside the `backend` folder:
   ```bash
   npx prisma db push
   ```
3. Revert your local `backend/.env` back to your local localhost connection string.
