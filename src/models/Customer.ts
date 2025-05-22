import { Invoice } from './Invoice';
import { parseCSVFile } from '../utils/parseCsv';


export class Customer {
    paid_invoices: Invoice[] = [];
    unpaid_invoices: Invoice[] = [];

    constructor(public name: string, public id?: string ) {}

    initializeFromCSV(csvPath: string): void {
    const raw_invoices = parseCSVFile(csvPath); 
        console.log('Csv len', raw_invoices.length)
        for (const invoice of raw_invoices) {
           
            const newInvoice = new Invoice(
            parseInt(invoice.InvoiceNumber),
            invoice.CustomerName,
            invoice.InvoiceDate,
            invoice.DueDate,
            invoice.paid
            );

            newInvoice.setRawDescription(invoice.LineItems);

            this.unpaid_invoices.push(newInvoice); 
        }
    }
}
