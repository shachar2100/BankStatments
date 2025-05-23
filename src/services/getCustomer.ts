import { supabase } from '../lib/supabaseClient';
import { Customer } from '../models/Customer';
import { getInvoice } from './getInvoice';

export async function getCustomer(customerName: string):
Promise<Customer> {
  // Step 1: Fetch customer by name
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('name', customerName)
    .single();

  if (customerError || !customer) {
    console.error('Error fetching customer:', customerError?.message);
    throw new Error('Error fetching customer :(');
  }

  const { paid_invoices, unpaid_invoices } = await getInvoice(customer.id);

  const customerObj = new Customer(customerName)
  customerObj.id = customer.id
  customerObj.paid_invoices = paid_invoices
  customerObj.unpaid_invoices = unpaid_invoices

  return customerObj
}
