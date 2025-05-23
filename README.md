# Atlas Challenge – LLM-Based Invoice Matching

This backend app ingests bank transactions, uses an LLM (OpenAI) to match them to customer invoices, and persists everything in Supabase. Built in TypeScript with Express.

---

## Setup

1. **Install dependencies**
```bash
npm install
````

2. **Create `.env`**

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

## API Endpoints

### `POST /:customer_name/transactions`

Ingest one or more transactions (as JSON). Each is matched to unpaid invoices using LLM-based reasoning.
**Returns:** a list of matched transaction IDs.

### `GET /matches/:customer_name/:transaction_id`

Returns the invoice(s) matched to a given transaction.

---

## 📁 Project Structure

```
src/
├── index.ts               # Main Express server
├── models/                # Invoice, Customer, BankStatement classes
├── services/              # DB logic (add/get invoice, customer, transactions)
├── utils/                 # Matching logic and CSV parser
├── lib/                   # Supabase client setup

data/
└── test_invoices.csv      # Static invoice test data

tests/
├── *.test.ts              # Unit tests
└── data/                  # Edge and simple test cases
```

---

## 🗃️ Supabase Tables

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

### `invoice_transactions` (matches)

| Field            | Type | Description              |
| ---------------- | ---- | ------------------------ |
| `id`             | UUID | Primary key              |
| `transaction_id` | UUID | FK → `bank_statement.id` |
| `invoice_id`     | UUID | FK → `invoices.id`       |
| `customer_id`    | UUID | FK → `customers.id`      |

> This is the "join table" used to log all invoice ↔ transaction matches.

---
┌──────────────────────────┐
│        customers         │
├────────────┬─────────────┤
│ id         │ UUID (PK)   │◄────────────┐
│ name       │ text        │             │
│ created_at │ timestamp   │             │
└────────────┴─────────────┘             │
                                         │
                                         │
                                         ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│        invoices          │    │     bank_statement       │
├────────────┬─────────────┤    ├────────────┬─────────────┤
│ id         │ UUID (PK)   │    │ id         │ UUID (PK)   │
│ invoice_number│ text     │    │ date       │ date        │
│ customer_id │ UUID (FK)  │────┘ description│ text        │
│ customer_name│ text      │    │ amount     │ float8      │
│ invoice_date│ date       │    │ customer_id│ UUID (FK)   │
│ due_date   │ date        │    │ created_at │ timestamp   │
│ line_items │ jsonb       │    └────────────┴─────────────┘
│ paid       │ boolean     │
│ created_at │ timestamp   │
└────────────┴─────────────┘

         ▲        ▲
         │        │
         │        │
         │        │
         │        └───────────────────────────┐
         │                                    │
         │                                    ▼
         └──────────────────────┐   ┌──────────────────────────┐
                                │   │   invoice_transactions   │
                                │   ├──────────────────────────┤
                                └──►│ id           │ UUID (PK) │
                                    │ transaction_id│ UUID (FK)│
                                    │ invoice_id   │ UUID (FK) │
                                    │ customer_id  │ UUID (FK) │
                                    └──────────────┴───────────┘

---

## Tech Stack

* TypeScript + Express
* Supabase (Postgres)
* OpenAI GPT-4
* Jest (for testing)


