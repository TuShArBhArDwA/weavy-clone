# Weaave - Visual AI Workflow Builder
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![React Flow](https://img.shields.io/badge/React_Flow-12-purple)
![Trigger.dev](https://img.shields.io/badge/Trigger.dev-Enabled-green)
![help](https://github.com/user-attachments/assets/6ab768b5-cf0f-416e-be80-a450f1e63094)

A pixel-perfect clone of [Weavy.ai](https://weavy.ai) — a visual workflow builder for LLM-powered automations. Built with React Flow, Google Gemini AI, and Trigger.dev.



**Watch the Demo:** [Click here to watch](https://drive.google.com/file/d/1nvQmwF1iAUaH0JjeI3jRUtwsZ-R7XV3T/view?usp=sharing)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [License](#license)
- [Connect with me](#connect-with-me)

---

## Features

- **Visual Workflow Canvas** — React Flow with drag & drop, panning, zooming, and minimap
- **6 Node Types** — Text, Image Upload, Video Upload, LLM, Crop Image, Extract Frame
- **AI-Powered Execution** — Google Gemini API with vision support
- **Background Processing** — All node executions via Trigger.dev tasks (No client-side API calls)
- **Workflow History** — Full execution history with node-level details
- **Real-time Status** — Pulsating glow effect on running nodes
- **Parallel Execution** — Independent branches run concurrently via Trigger.dev
- **Media Processing** — Cloud-native video processing with **FFmpeg** on Trigger.dev (Crop, Extract Frame)
- **Smart Timestamps** — Extract frames using seconds or percentage (e.g., "50%")
- **Robust Execution** — Strict failure propagation and error handling
- **File Uploads** — Secure, scalable uploads via **Transloadit**
- **Authentication** — Clerk-powered user authentication
- **Data Persistence** — PostgreSQL with Prisma ORM

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI Library | React 19, React Flow |
| Styling | Tailwind CSS |
| State | Zustand |
| Database | PostgreSQL + Prisma |
| Auth | Clerk |
| AI | Google Gemini API |
| Background Jobs | Trigger.dev |
| Validation | Zod |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database ([Neon](https://neon.tech) or [Supabase](https://supabase.com))
- [Clerk](https://clerk.com) account
- [Google AI Studio](https://aistudio.google.com) API key
- [Trigger.dev](https://trigger.dev) account

### Installation

```bash
# Clone the repository
git clone https://github.com/TuShArBhArDwA/weaave.git
cd weavy-clone

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your API keys in .env (see .env.example for detailed instructions)

# Push database schema
npx prisma db push

# Run development server
npm run dev

# (In a separate terminal) Run Trigger.dev
npm run trigger:dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

See [`.env.example`](.env.example) for detailed setup instructions.

| Variable | Description | Get it from |
|----------|-------------|-------------|
| `DATABASE_URL` | PostgreSQL connection string | [Neon](https://neon.tech) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | [Clerk](https://clerk.com) |
| `CLERK_SECRET_KEY` | Clerk secret key | [Clerk](https://clerk.com) |
| `GEMINI_API_KEY` | Google Gemini API key | [Google AI Studio](https://aistudio.google.com) |
| `TRIGGER_SECRET_KEY` | Trigger.dev secret key | [Trigger.dev](https://trigger.dev) |
| `NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY` | Transloadit Auth Key | [Transloadit](https://transloadit.com) |
| `NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID` | Transloadit Template ID | [Transloadit](https://transloadit.com) |

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   └── workflow/        # Workflow canvas & nodes
├── lib/                 # Utilities & types
├── store/               # Zustand state management
├── trigger/             # Trigger.dev background tasks
└── prisma/              # Database schema
```

## Documentation

| Document | Description |
|----------|-------------|
| [High-Level Design (HLD)](docs/HLD.md) | System architecture, components, and data flow |
| [Low-Level Design (LLD)](docs/LLD.md) | Database schema, API endpoints, and execution flow |

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Connect with me

If you'd like to connect, feel free to reach out — [Click here](https://minianonlink.vercel.app/tusharbhardwaj)
