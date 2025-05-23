// src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import { AddressInfo } from 'net';

import { BankStatement } from './models/BankStatement';
import { bankstatementIdExists } from './services/addBankstatement';

import { Invoice } from './models/Invoice';
import { getCustomer } from './services/getCustomer';
import { saveBankStatment } from './services/addBankstatement';
import { supabase } from './lib/supabaseClient';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/**
 * POST /:customer_name/transactions
 * → Accepts and saves one or more incoming transactions,
 * performs LLM matching and returns transaction IDs.
 */
app.post('/:customer_name/transactions', async (req: Request, res: Response) => {
  const { customer_name } = req.params;
  const transactions: any[] = Array.isArray(req.body) ? req.body : [req.body];

  try {
    let customer = await getCustomer(decodeURIComponent(customer_name));
    
    const transactionIds: string[] = [];

    for (const txnData of transactions) {
      const txn = new BankStatement(txnData.date, txnData.description, txnData.amount);
      const txnId = await saveBankStatment(txn, customer);
      transactionIds.push(txnId);
      customer = await getCustomer(customer.name);
    }

    res.status(201).json({ transaction_ids: transactionIds });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

/**
 * GET /matches/:customer_name/:transaction_id
 * → Fetches all invoice matches for a given transaction
 */
app.get('/matches/:customer_name/:transaction_id', async (req: Request, res: Response) => {
  const { customer_name, transaction_id } = req.params;

  try {
    const customer = await getCustomer(decodeURIComponent(customer_name));
 
    // 1. Fetch invoice_ids from invoice_transactions for this transaction & customer
    const { data: links, error: linkErr } = await supabase
      .from('invoice_transactions')
      .select('invoice_id')
      .eq('transaction_id', transaction_id)
      .eq('customer_id', customer.id);

    if (linkErr) throw linkErr;
   
    const invoiceIds = links.map((l) => l.invoice_id);

    // 2. Fetch invoice data
    const { data: invoiceRows, error: invErr } = await supabase
      .from('invoices')
      .select('*')
      .in('id', invoiceIds);


    const invoices = (invoiceRows || []).map((row) => Invoice.fromJSON(row));


    if (! await bankstatementIdExists(transaction_id, customer.id)){
      throw new Error(`No such bank statment "${transaction_id}"`);
    }


    res.json({ invoices });

    
  } catch (err) {
    console.error('GET /matches error:', err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

const server = app.listen(port, () => {
  const address = server.address() as AddressInfo;
  console.log(`Server running on port ${address.port}`);
});
