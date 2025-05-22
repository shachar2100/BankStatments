import { Customer } from './models/Customer';
import { Transaction } from './models/Transaction';
import { saveCustomerOrUpdate } from './services/saveCustomerOrUpdate';
import { saveTransactionForCustomer } from './services/saveTransaction';



// Adjust the path to your CSV file
const CSV_PATH = './data/test_invoices.csv';

async function main() {

    // 1. Create a customer and initialize invoices from CSV
    const customer = new Customer('Acme Inc.');
    customer.initializeFromCSV(CSV_PATH); // populates unpaid_invoices[]
    console.log('unpaid', customer.unpaid_invoices.length)
    // 2. Save to Supabase (upsert logic included)
    const customerId = await saveCustomerOrUpdate(customer);
    customer.id = customerId
    

    console.log(`✅ Customer saved with ID: ${customerId}`);


    try {
      // 1. Define the transaction
      const txn = new Transaction(
        "2025-03-01", 
        "Delta Co website", 
        '339'
      );
    
      // 3. Run the save process (will match and mark invoice(s) paid)
      await saveTransactionForCustomer(txn, customer.id);
  
      console.log('🎉 Transaction processed successfully.');
    } catch (err) {
      console.error('❌ Error processing transaction:', (err as Error).message);
    }

}

main();
