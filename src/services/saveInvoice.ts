// src/services/customerService.ts

import { supabase } from '../lib/supabaseClient';
import { Customer } from '../models/Customer';
import { saveInvoice } from './invoiceService';

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

    // Optional update (you can skip if name can't change)
    const { error: updateError } = await supabase
      .from('customers')
      .update({ name: customer.name })
      .eq('id', customerId);

    if (updateError) {
      throw new Error(`Failed to update customer "${customer.name}": ${updateError.message}`);
    }
  } else {
    // Insert new customer
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

  // 2. Save invoices (both paid and unpaid)
  const allInvoices = [...customer.paid_invoices, ...customer.unpaid_invoices];

  for (const invoice of allInvoices) {
    await saveInvoice(invoice, customerId);
  }

  return customerId;
}
