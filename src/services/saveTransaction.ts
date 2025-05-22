import { supabase } from '../lib/supabaseClient';
import { Transaction } from '../models/Transaction';
import { Invoice } from '../models/Invoice';
import { llmMatch } from '../utils/matching';

export async function transactionExists(
    txn: Transaction,
    customerId: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('transactions')
      .select('id')
      .eq('customer_id', customerId)
      .eq('date', txn.date)
      .eq('description', txn.description)
      .eq('amount', parseFloat(txn.amount))
      .maybeSingle(); // allows no match without throwing
  
    if (error) {
      console.error('Failed to check for existing transaction:', error.message);
      throw new Error('Could not check if transaction exists');
    }
  
    return !!data; // true if found, false if not
  }



export async function saveTransactionForCustomer(
    txn: Transaction,
    customerId: string
  ): Promise<void> {
    const amountNumeric = parseFloat(txn.amount);
  
    const exists = await transactionExists(txn, customerId);
    if (exists) {
      console.log(`⚠️ Transaction already exists — skipping insert.`);
      return;
    }
  
    // Fetch unpaid invoices for this customer
    const { data: invoiceRows, error: fetchErr } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .eq('paid', false);
  
    if (fetchErr || !invoiceRows) {
      throw new Error(`Failed to fetch invoices: ${fetchErr?.message}`);
    }
  
    const invoices = invoiceRows.map((row) => Invoice.fromJSON(row));

    // console.log(invoices)
    // console.log(txn)
    
    // Use LLM to match invoices
    const matchedInvoices = await llmMatch(txn, invoices);
  
    // Insert the transaction
    const { data: insertedTxn, error: txnErr } = await supabase
      .from('transactions')
      .insert({
        date: txn.date,
        description: txn.description,
        amount: amountNumeric,
        customer_id: customerId,
      })
      .select()
      .single();
  
    if (txnErr || !insertedTxn) {
      throw new Error(`Failed to insert transaction: ${txnErr?.message}`);
    }
  
    // Link each matched invoice using join table
    for (const invoice of matchedInvoices) {
      const { error: linkErr } = await supabase
        .from('invoice_transactions')
        .insert({
          transaction_id: insertedTxn.id,
          invoice_id: invoice.id,
        });
  
      if (linkErr) {
        throw new Error(`Failed to link invoice ${invoice.invoice_number}: ${linkErr.message}`);
      }
  
      const { error: updateErr } = await supabase
        .from('invoices')
        .update({ paid: true })
        .eq('id', invoice.id);
  
      if (updateErr) {
        throw new Error(`Failed to update invoice ${invoice.invoice_number}: ${updateErr.message}`);
      }
    }
  
    console.log(
      `✅ Transaction inserted and linked to ${matchedInvoices.length} invoice(s).`
    );
  }
  