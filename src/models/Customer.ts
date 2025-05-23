import { Invoice } from './Invoice';
import { parseCSVFile } from '../utils/parseCsv';
import { v4 as uuidv4 } from 'uuid';


export class Customer {
    paid_invoices: Invoice[] = [];
    unpaid_invoices: Invoice[] = [];

    constructor(public name: string, public id: string = uuidv4()  ) {}

    initializeFromCSV(csvPath: string): void {
    const raw_invoices = parseCSVFile(csvPath); 
        console.log('Csv len', raw_invoices.length)
        for (const invoice of raw_invoices) {
           
            const newInvoice = new Invoice(
            parseInt(invoice.InvoiceNumber),
            invoice.CustomerName,
            invoice.InvoiceDate,
            invoice.DueDate,
            invoice.paid,
            invoice.id 
            );

            newInvoice.setRawDescription(invoice.LineItems);

            this.unpaid_invoices.push(newInvoice); 
        }
    }
}
