# rambrij.com — Personal Website of Ram Brij

> Senior Engineering Manager · Software Architect · Performance Engineering Expert · IEEE Senior Member

---

## About Ram Brij

Ram Brij is a Senior Engineering Manager with over **18 years of experience** designing, building, and optimizing high-performance, cloud-native, and distributed enterprise systems. He specializes in software architecture, performance engineering, microservices, AI-powered applications, and modern quality engineering practices.

Throughout his career, Ram has led the development of mission-critical platforms supporting **secure digital payments, fraud detection, and high-throughput transaction processing**, including EMVCo-certified Access Control Server (ACS) solutions for 3-D Secure authentication. His experience spans cloud-native architectures, event-driven systems, observability, CI/CD automation, and performance engineering for large-scale enterprise applications.

Ram is the creator of the **SCALE Framework** — a practical performance engineering model developed from real-world enterprise experience to help engineering teams evolve from traditional performance testing to continuous performance engineering.

An **international conference speaker**, **IEEE Senior Member**, **published author**, and active peer reviewer, Ram is passionate about sharing practical engineering strategies that help organizations build reliable, scalable, resilient, and cost-efficient software for today's cloud-native, distributed, and AI-powered systems.

---

## What This Website Offers

### For Visitors

| Feature | Description |
|---|---|
| **Bio & About** | Ram's full professional background, areas of expertise, and career highlights |
| **Blog** | In-depth articles on software architecture, performance engineering, cloud-native systems, AI, and the SCALE Framework |
| **Reactions** | React to any article with 👍 Like, ❤️ Love, 💡 Insightful, or 🎉 Celebrate |
| **Comments** | Leave comments and engage in discussions on any published article |
| **User Accounts** | Free registration to participate in the community — comment and react on articles |

### For Ram (Admin)

| Feature | Description |
|---|---|
| **Admin Dashboard** | Manage all blog posts from a protected dashboard |
| **Markdown Editor** | Write articles in Markdown — rendered as clean, formatted HTML |
| **Publish Control** | Save drafts and publish when ready |
| **Post Management** | Edit, update, or remove any article at any time |

---

## Areas of Expertise Covered in Articles

- **Software Architecture & Design** — patterns, principles, and real-world trade-offs
- **Performance Engineering** — the SCALE Framework, load testing, continuous performance
- **Cloud-Native Systems** — microservices, containers, Kubernetes, event-driven architecture
- **Secure Digital Payments** — 3-D Secure, EMVCo ACS, fraud detection systems
- **AI-Powered Applications** — integrating AI/ML into enterprise software
- **CI/CD & DevOps** — automation, observability, reliability engineering
- **Quality Engineering** — shifting left, modern testing strategies
- **Leadership & Engineering Management** — building high-performing engineering teams

---

## The SCALE Framework

Ram created the **SCALE Framework** — a structured approach to performance engineering:

| Letter | Pillar | Focus |
|---|---|---|
| **S** | Strategy | Defining performance goals aligned with business outcomes |
| **C** | Continuous | Integrating performance testing into every stage of the pipeline |
| **A** | Architecture | Designing systems that are inherently performant and resilient |
| **L** | Logging & Observability | Measuring what matters with the right metrics and traces |
| **E** | Efficiency | Optimizing cost, throughput, and resource utilization |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, SSR + ISR) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL via Neon (serverless, free tier) |
| ORM | Prisma v5 |
| Authentication | NextAuth.js v5 (JWT, bcrypt) |
| Hosting | AWS Amplify |
| Domain | rambrij.com |

---

## Environments

| Environment | URL | Branch | Database |
|---|---|---|---|
| Local | `http://localhost:3000` | any feature branch | Neon `dev` branch |
| QA | `https://qa.rambrij.com` | `qa` | Neon `qa` branch |
| Production | `https://www.rambrij.com` | `main` | Neon `main` branch |

---

## Local Development Setup

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) account (free)

### 1. Clone and install

```bash
git clone https://github.com/smartrchauhan/rambrij-chauhan.git
cd rambrij-chauhan
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Neon `dev` branch connection strings and a generated auth secret:

```bash
# Generate AUTH_SECRET
openssl rand -base64 32
```

### 3. Set up the database

```bash
# Create tables
npx prisma migrate dev --name init

# Create admin account
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=YourPassword123! npm run db:seed
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — sign in at `/auth/login` with your admin credentials.

---

## Deployment

This site deploys automatically via **AWS Amplify**:

- Push to `qa` branch → deploys to `https://qa.rambrij.com`
- Merge to `main` → deploys to `https://www.rambrij.com`

Environment variables (DB credentials, auth secret) are stored encrypted in the AWS Amplify console — never in this repository.

See `.env.qa.example` and `.env.prod.example` for the required variables per environment.

---

## Security

- All passwords hashed with **bcrypt** (cost factor 12)
- **JWT sessions** with 1-hour expiry — httpOnly, secure, sameSite cookies
- **Admin routes** protected at middleware level — non-admin users are redirected
- **Input validation** via Zod on every API endpoint
- **XSS prevention** — blog content sanitized server-side; comments rendered as plain text only
- **SQL injection** not possible — Prisma uses parameterized queries exclusively
- **Rate limiting** on registration, login, and comment endpoints
- **Security headers** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy

---

## Available Scripts

```bash
npm run dev              # Start local development server
npm run build            # Production build
npm run db:migrate:dev   # Create and apply a new migration (dev only)
npm run db:migrate:deploy # Apply existing migrations (QA/Prod)
npm run db:seed          # Create admin account (set ADMIN_EMAIL and ADMIN_PASSWORD)
npm run db:studio        # Open Prisma Studio (visual DB browser)
```

---

*Built with Next.js · Hosted on AWS · © Ram Brij*
