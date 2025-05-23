// src/services/invoiceService.ts

import { supabase } from '../lib/supabaseClient';
import { Invoice } from '../models/Invoice';

export async function addInvoice(invoice: Invoice, customerId: string): Promise<void> {
  const dataToSave = {
    invoice_number: invoice.invoice_number,
    customer_id: customerId,
    customer_name: invoice.customer_name,
    invoice_date: invoice.invoice_date,
    due_date: invoice.due_date,
    line_items: invoice.line_items,
    paid: invoice.paid,
    id: invoice.id
  };


  const { error } = await supabase.from('invoices').upsert(dataToSave);

  if (error) {
    console.error(`Failed to save invoice #${invoice.invoice_number}:`, error.message);
    throw new Error(`Failed to save invoice #${invoice.invoice_number}: ${error.message}`);
  }
}
