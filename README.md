# LLM-Powered Invoice Matching Service

This project is a backend service that ingests banking transactions and uses an LLM to intelligently match them to static customer invoices. The results, along with all source data, are stored in a Supabase Postgres database. It is designed to simulate a real-world finance automation workflow in the accounts receivable space.

Built with TypeScript and Express.

---

## 🧠 Context

In many businesses, particularly SaaS, incoming payments need to be reconciled against issued invoices — a process known as **cash application**. This can be time-consuming and error-prone when done manually, especially when transactions contain vague or inconsistent descriptions. This project uses an LLM to automate that matching process using semantic reasoning, enabling faster and more accurate reconciliation.

---

## ✨ Key Features

* Accepts and stores incoming transaction data
* Uses an LLM to semantically match transactions to customer invoices
* Supports invoice and transaction storage, retrieval, and linkage
* Fully built with TypeScript, Supabase, and OpenAI
* Modular, testable, and ready for local deployment or expansion

---

## 🚀 Getting Started

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**

Create a `.env` file with the following:

```env
SUPABASE_URL=your-url
SUPABASE_ANON_KEY=your-key
OPENAI_API_KEY=your-openai-key
```

3. **Run the server**

```bash
npx ts-node src/index.ts
```

---

## 📡 API Endpoints

### `POST /:customer_name/transactions`

Ingest one or more bank transactions in JSON format. The backend attempts to match each transaction to one or more invoices using LLM-based reasoning.

**Returns:** a list of transaction IDs and their matched invoice references.

---

### `GET /matches/:customer_name/:transaction_id`

Retrieve matched invoice(s) for a specific transaction.

---

## 🧾 Data Model & Structure

```
src/
├── index.ts               # Main Express server
├── models/                # Domain models for Invoices, Customers, etc.
├── services/              # Persistence logic for Supabase
├── utils/                 # Matching logic, CSV parsers, helpers
├── lib/                   # Supabase client configuration

data/
└── test_invoices.csv      # Sample invoice data

tests/
├── *.test.ts              # Unit tests
└── data/                  # Test datasets
```

---

## 🗃️ Supabase Schema Overview

### `customers`

| Field        | Type      | Description          |
| ------------ | --------- | -------------------- |
| `id`         | UUID      | Primary key          |
| `name`       | text      | Unique customer name |
| `created_at` | timestamp | Auto-filled          |

---

### `invoices`

| Field            | Type      | Description                     |
| ---------------- | --------- | ------------------------------- |
| `id`             | UUID      | Primary key                     |
| `invoice_number` | text      | External-facing invoice number  |
| `customer_id`    | UUID      | FK → `customers.id`             |
| `customer_name`  | text      | Denormalized name (convenience) |
| `invoice_date`   | date      | Date the invoice was issued     |
| `due_date`       | date      | When the invoice is due         |
| `line_items`     | jsonb     | Parsed items from description   |
| `paid`           | boolean   | Whether it's been matched/paid  |
| `created_at`     | timestamp | Auto-filled                     |

---

### `bank_statement`

| Field         | Type      | Description             |
| ------------- | --------- | ----------------------- |
| `id`          | UUID      | Primary key             |
| `date`        | date      | Date of the transaction |
| `description` | text      | What the charge was for |
| `amount`      | float8    | Amount spent            |
| `customer_id` | UUID      | FK → `customers.id`     |
| `created_at`  | timestamp | Auto-filled             |

---

### `invoice_transactions` (join table)

| Field            | Type | Description              |
| ---------------- | ---- | ------------------------ |
| `id`             | UUID | Primary key              |
| `transaction_id` | UUID | FK → `bank_statement.id` |
| `invoice_id`     | UUID | FK → `invoices.id`       |
| `customer_id`    | UUID | FK → `customers.id`      |

Used to store match relationships between transactions and invoices.

---

## 🧪 Testing

Tests live under the `tests/` directory and cover core functionality of the matching and ingestion pipeline.

To run tests:

```bash
npm test
```

---

## 🧰 Tech Stack

* TypeScript + Express
* Supabase (Postgres)
* OpenAI GPT-4
* Jest (unit testing)

