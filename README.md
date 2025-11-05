# RealFreeLit 📦

**RealFreeLit** is a modern TypeScript-based web application designed to streamline checkout experiences and newsletter engagement. Built with Supabase, Tailwind CSS, and Vite, it offers GPS-enabled address capture, admin role management, and subscriber tracking—all in a clean, scalable architecture.

## 🚀 Features

- **GPS-Enabled Checkout**: Automatically fetches user location during checkout for seamless address input.
- **Newsletter Management**: Collects and stores subscriber emails using Supabase.
- **Admin Panel**: Assign roles, verify users, and manage pricing (optional).
- **Responsive UI**: Styled with Tailwind CSS for fast, mobile-friendly layouts.
- **Supabase Integration**: Handles authentication, database operations, and real-time updates.
- **Vite-Powered Build**: Fast development and optimized production builds.

## 🛠️ Tech Stack

| Layer         | Technology        |
|--------------|-------------------|
| Frontend     | TypeScript, React |
| Styling      | Tailwind CSS      |
| Backend      | Supabase          |
| Build Tool   | Vite              |
| Deployment   | Vercel            |

## 📁 Project Structure

- `src/` – Core application logic
- `public/` – Static assets (fonts, icons)
- `supabase/` – Database schema and configuration
- `TODO.md` – Development roadmap and feature checklist

## 🧪 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/sathwikreddy4658-sudo/realfreelit.git
   cd realfreelit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Supabase:
   - Add your Supabase keys to `.env`
   - Set up tables for `subscribers`, `users`, and `roles`

4. Run the development server:
   ```bash
   npm run dev
   ```

## 📬 Newsletter Setup

- Subscribers are stored in Supabase under the `subscribers` table.
- Admins can view and manage entries via the dashboard.

## 📍 GPS Checkout

- Uses browser geolocation API to capture latitude and longitude.
- Converts coordinates to address using external APIs (configurable).

This project was proudly developed with the help of AI tool Lovable, a collaborative development platform that empowers teams to build with joy.
