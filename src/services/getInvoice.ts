import { supabase } from '../lib/supabaseClient';
import { Invoice } from '../models/Invoice';



export async function getInvoice(customerId: string): Promise<{
    paid_invoices: Invoice[];
    unpaid_invoices: Invoice[];
  }> {
    // The assumption is that the customer Name is already in System

    // Get invoices with specific customer id form supabase
    const { data: invoices, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('customer_id', customerId);

  if (invoiceError) {
    console.error('Error fetching invoices:', invoiceError.message);
    return { paid_invoices: [], unpaid_invoices: [] };
  }

  
    const paidInvoices: Invoice[] = [];
    const unpaidInvoices: Invoice[] = [];
    for (const inv of invoices || []) {

        const invoice = Invoice.fromJSON(inv)

        if (invoice.paid) {
            paidInvoices.push(invoice)
        } else {
            unpaidInvoices.push(invoice)
        }
    }


  return { paid_invoices: paidInvoices, unpaid_invoices: unpaidInvoices }
}
  
