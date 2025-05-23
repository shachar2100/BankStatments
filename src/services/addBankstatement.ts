import { supabase } from '../lib/supabaseClient';
import { BankStatement } from '../models/BankStatement';
import { llmMatch } from '../utils/matching';
import { Customer } from '../models/Customer';



export async function bankstatementExists(
  txn: BankStatement,
  customerId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('bank_statement')
    .select('id')
    .eq('customer_id', customerId)
    .eq('date', txn.date)
    .eq('description', txn.description)
    .eq('amount', parseFloat(txn.amount))
    .maybeSingle();

  if (error) {
    console.error('Failed to check for existing transaction:', error.message);
    throw new Error('Could not check if transaction exists');
  }

  return data?.id ?? null;
}

export async function bankstatementIdExists(
  txnID: string,
  customerId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('bank_statement')
    .select('id')
    .eq('id', txnID)
    .eq('customer_id', customerId)
    .maybeSingle();

  if (error) {
    console.error('Failed to check for existing transaction:', error.message);
    throw new Error('Could not check if transaction exists');
  }

  return data?.id ?? null;
}



export async function saveBankStatment(
    txn: BankStatement,
    customer: Customer
): Promise<string>{
    const txnid = await bankstatementExists(txn, customer.id)
    if (txnid) {
        console.error('Transaction already exsists:', txn);
        return txnid
    }

    // Insert the transaction
    const { data: insertedTxn, error: txnErr } = await supabase
      .from('bank_statement')
      .insert({
        date: txn.date,
        description: txn.description,
        amount: txn.amount,
        customer_id: customer.id,
        id: txn.id
      })
      .select()
      .single();
  
    if (txnErr || !insertedTxn) {
      throw new Error(`Failed to insert transaction: ${txnErr?.message}`);
    }

 
    
    const matchedInvoices = await llmMatch(txn, customer.unpaid_invoices); 
    console.log("Banc Statment id: ", txn.id, " matched Invoices: ", matchedInvoices)
    // Link each matched invoice using join table
    for (const invoice of matchedInvoices) {
        const { error: linkErr } = await supabase
          .from('invoice_transactions')
          .insert({
            transaction_id: insertedTxn.id,
            invoice_id: invoice.id,
            customer_id: customer.id
          });
          
        
        if (linkErr) {
          // console.log(invoice)
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
   
 

    return txn.id

}