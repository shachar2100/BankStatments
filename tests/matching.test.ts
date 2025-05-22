import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Invoice } from '../src/models/Invoice';
import { Transaction } from '../src/models/Transaction';
import { Customer } from '../src/models/Customer';
import { llmMatch } from '../src/utils/matching';

// Load .env for OpenAI API key
dotenv.config();

// Define the shape of each test case
type TestCase = {
  transaction: {
    date: string;
    description: string;
    amount: number;
  };
  expected_invoice: string;
};

// Load test cases from JSON file
const raw = fs.readFileSync(path.resolve(__dirname, './data/simpletests.json'), 'utf-8');
const testCases: TestCase[] = JSON.parse(raw);

describe('Transaction → Invoice Matching Test', () => {
  let customer: Customer;

  beforeAll(async () => {
    customer = new Customer('Shachar');
    await customer.initializeFromCSV('./data/test_invoices.csv');
  });

  test.each(testCases)(
    'matches transaction to invoice %#',
    async ({ transaction, expected_invoice }) => {
      const txn = new Transaction(
        transaction.date,
        transaction.description,
        transaction.amount.toString()
      );

      const result = await llmMatch(txn, customer.unpaid_invoices);
      const matchedInvoiceNumbers = result.map((inv) => inv.invoice_number);
    console.log('Matched Invoice Numbers:', matchedInvoiceNumbers);

      expect(result).not.toBeNull();
      expect(matchedInvoiceNumbers).toStrictEqual(expected_invoice);
    }
  );
});
