import { supabase } from '../lib/supabaseClient';
import { Customer } from '../models/Customer';
import { addInvoice } from './addInvoice';

export async function saveCustomerOrUpdate(customer: Customer): Promise<string> {
  // 1. Check if customer exists
  const { data: existing, error: fetchError } = await supabase
    .from('customers')
    .select('id')
    .eq('name', customer.name)
    .single();

  let customerId: string;

  if (existing) {
    customerId = existing.id;

  } else {
    // 3. Insert new customer
    const { data: inserted, error: insertError } = await supabase
      .from('customers')
      .insert({ name: customer.name })
      .select()
      .single();

    if (!inserted || insertError) {
      throw new Error(`Failed to insert customer "${customer.name}": ${insertError?.message}`);
    }

    customerId = inserted.id;
  }
  var i = 0;
  // 4. Save invoices (this will insert or update them)
  for (const invoice of [...customer.unpaid_invoices, ...customer.paid_invoices]) {
    const isPaid = customer.paid_invoices.includes(invoice);
    invoice.paid = isPaid
    await addInvoice(invoice, customerId);
  }

  return customerId;
}
