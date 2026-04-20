# GenBI Analytics v2.0

<div align="center">
  <img width="800" alt="GenBI Analytics Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## 📊 About the Project

**GenBI Analytics v2.0** is a smart, interactive React-based platform for retreat and course analytics. It features automatic ETL (Extract, Transform, Load) for unstructured data and a generative BI assistant for natural language insights.

> **💡 Portfolio Note:** This system was initially developed as a custom solution for **KMC Madrid** (Kadampa Meditation Center) to handle their specific operational and analytical needs. It has since been generalized and adopted as a portfolio project under the name **GenBI Analytics v2.0** to showcase advanced integrations between modern web frameworks, cloud databases, and Artificial Intelligence.

The system seamlessly connects to a **Supabase** database and features a built-in **AI Assistant** (powered by the Google Gemini API), providing deep insights from complex datasets.

## ✨ Key Features

- **🔒 Secure Authentication:** Restricted access managed through Supabase Auth.
- **📈 Real-Time Analytics Dashboard:**
  - **KPIs:** Overview of Total Revenue, Number of Students, Confirmed Reservations, and Average Ticket Size.
  - **Visual Charts:** Revenue Evolution (area chart), Most Popular Courses Distribution (pie chart), and Revenue by Event (bar chart).
  - **Data Table:** Comprehensive and filterable list of all transactions and enrolled students.
- **🤖 GenBI Assistant:** An AI chatbot with contextual access to database records, capable of answering complex questions regarding revenue, categories, or payment methods.
- **🛡️ Data Privacy & GDPR Compliance:** Built-in anonymization techniques ensure that Personally Identifiable Information (PII) such as customer emails and real names are masked and never exposed to external AI APIs (like Google Gemini).

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling & UI:** Tailwind CSS, Lucide React (Icons)
- **Data Visualization:** Recharts
- **Backend as a Service:** Supabase (Database and Auth)
- **Artificial Intelligence:** Google Gemini API (`@google/genai`)

---

## 🚀 How to Run Locally

### Prerequisites

- **Node.js** (version 18 or higher)
- **Google Gemini** API Key
- (Optional) Your own **Supabase** project

### 🗄️ Database Setup

If you want to use your own Supabase instance:
1. Go to your Supabase Project Dashboard.
2. Open the **SQL Editor**.
3. Copy the contents of [`database/setup.sql`](file:///c:/Users/cejas/Documents/Poliphonia/GenBI-Anlytics/database/setup.sql) and run it.
4. This will create the `fact_transactions` table and populate it with sample portfolio data.

### Step-by-Step Guide

1. Clone the repository or navigate to the project directory:
   ```bash
   cd GenBI-KMC-Madrid-Anlytics
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   Create or edit the `.env.local` file in the root directory and add your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_google_gemini_api_key
   ```

> [!CAUTION]
> **Security Note on API Keys**: In this frontend-only implementation, `VITE_GEMINI_API_KEY` is bundled with the client-side code. For a production-ready application, AI calls should be proxied through a secure backend or Supabase Edge Functions to keep API keys hidden from the browser.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open the application in your browser (usually at `http://localhost:5173`).

---

## 📂 Code Structure Overview

```text
.
├── components/          # React UI components
│   ├── layout/          # Sidebar, Header, and MainLayout
│   ├── charts/          # Modular Recharts components
│   ├── Dashboard.tsx    # Main performance panel
│   ├── ChatAssistant.tsx # AI Chat Interface
│   └── Login.tsx        # Authentication view
├── hooks/               # Custom React hooks (Data processing & stats)
├── services/            # External API integrations (Supabase, Gemini)
├── database/            # SQL setup and seeding scripts
├── DOCUMENTATION.md     # Product requirements and technical planning
├── utils.ts             # Utility functions (formatting, calculations)
├── types.ts             # TypeScript type definitions
├── App.tsx              # Root application orchestrator
└── package.json         # Node configuration and dependencies
```
