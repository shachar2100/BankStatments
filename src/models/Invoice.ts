import { BankStatement } from './BankStatement';
import { v4 as uuidv4 } from 'uuid';

export class Invoice {
  public matching_transactions: BankStatement[] = [];

  private _line_items: Record<string, number> = {};

  constructor(
    public invoice_number: number,
    public customer_name: string,
    public invoice_date: string,
    public due_date: string,
    public paid: boolean,
    public id: string = uuidv4()   
  ) {}

  setRawDescription(description: string): void {
    this._line_items = this.parseLineItems(description);
  }

  get line_items(): Record<string, number> {
    return this._line_items;
  }

  private parseLineItems(description: string): Record<string, number> {
    const result: Record<string, number> = {};
    const parts = description.split(';');

    for (const part of parts) {
      const [key, value] = part.split(':').map((s) => s.trim());

      if (key && value) {
        const numeric = parseInt(value.replace(/[$,]/g, ''), 10);
        result[key] = isNaN(numeric) ? 0 : numeric;
      }
    }

    return result;
  }

  getString(): string {
    const lineItemsFormatted = Object.entries(this._line_items)
      .map(([item, amount]) => `  - ${item}: $${amount}`)
      .join('\n');

    const transactionsFormatted = this.matching_transactions.length > 0
      ? this.matching_transactions
          .map(
            (txn, idx) =>
              `  ${idx + 1}. ${txn.date} | $${txn.amount} | ${txn.description}`
          )
          .join('\n')
      : '  (none)';

    return `
Id ${this.id}
Customer: ${this.customer_name}
Invoice Date: ${this.invoice_date}
Due Date: ${this.due_date}
Paid: ${this.paid}

Line Items:
${lineItemsFormatted}

Matching Transactions:
${transactionsFormatted}
    `.trim();
  }

  toJSON(): any {
    return {
      id: this.id,
      customer_name: this.customer_name,
      invoice_date: this.invoice_date,
      due_date: this.due_date,
      paid: this.paid,
      line_items: this._line_items,
    };
  }

  static fromJSON(data: any): Invoice {
    const invoice = new Invoice(
      data.invoice_number,
      data.customer_name,
      data.invoice_date,
      data.due_date,
      data.paid,
      data.id
    );
  
    // Directly assign line_items if present
    if (data.line_items) {
      invoice._line_items = data.line_items;
    }
  
    // Optionally backfill from raw description if needed
    if (!data.line_items && data.raw_description) {
      invoice.setRawDescription(data.raw_description);
    }
  
    return invoice;
  }  
}