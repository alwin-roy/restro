# Restro — Restaurant Web Application

A modern, production-ready web application built exclusively for a single restaurant.

> **Note:** This is a custom solution for a single restaurant, not a multi-tenant SaaS platform.

---

## Technology Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS (v4)
- **Icons:** Lucide React
- **UI Components:** Custom reusable components with future support for shadcn/ui
- **Database (Future):** PostgreSQL via Supabase
- **Package Manager:** npm

---

## Project Structure

```text
restro/
├── public/               # Static assets
├── src/
│   ├── app/              # App router pages, layouts, and styles
│   │   ├── globals.css   # Global styles and Tailwind configuration
│   │   ├── layout.tsx    # Root layout and metadata
│   │   └── page.tsx      # Homepage
│   ├── components/       # Shared UI components
│   │   └── ui/           # Primitive/atomic UI components (shadcn-compatible)
│   ├── features/         # Feature-specific modules
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Shared utility functions (e.g., cn)
│   └── types/            # Shared TypeScript types
├── .env.example          # Environment variable template
├── .gitignore            # Git ignore configuration
├── next.config.ts        # Next.js configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

---

## Getting Started

### Prerequisites

- Node.js 18.18+ or 20+
- npm

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

### Production Build

```bash
npm run build
npm run start
```

### Code Quality & Validation

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## Design Principles

- **Mobile-First Responsive Design:** Prioritizes mobile usability without sacrificing tablet and desktop experiences.
- **Performance:** Optimized font delivery with `next/font`, zero unnecessary client JS, and overflow-protected layouts.
- **Security:** OWASP-aligned principles, strict TypeScript checks, and explicit client/server component boundaries.
