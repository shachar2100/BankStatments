import { Invoice } from '../src/models/Invoice';
import { Transaction } from '../src/models/Transaction';

describe('Invoice', () => {
  it('should initialize with no matching transactions', () => {
    const invoice = new Invoice(124, 'Bob', '2025-05-01', '2025-06-01', false);
    expect(invoice.matching_transactions).toEqual([]);
  });

  it('should allow adding matching transactions', () => {
    const invoice = new Invoice(125, 'Carol', '2025-05-01', '2025-06-01', false);
    const txn = new Transaction('2025-05-05', 'payment', '100.00');
    invoice.matching_transactions.push(txn);

    expect(invoice.matching_transactions.length).toBe(1);
    expect(invoice.matching_transactions[0]).toBe(txn);
  });

  it('should parse line items from raw description', () => {
    const invoice = new Invoice(123, 'Alice', '2025-05-01', '2025-06-01', false);
    invoice.setRawDescription("SEO Services: $1703; Domain Renewal: $272; Consulting: $1281");

    expect(invoice.line_items).toEqual({
      "SEO Services": 1703,
      "Domain Renewal": 272,
      "Consulting": 1281
    });
  });

  describe('Invoice Line Item Parsing from dataset', () => {
    const testCases = [
      {
        invoiceNumber: 1202,
        customerName: 'Global Tech',
        invoiceDate: '2025-01-13',
        dueDate: '2025-01-28',
        lineItems: 'SEO Services: $1609; Web Design: $715',
        paid: false,
        expected: {
          'SEO Services': 1609,
          'Web Design': 715,
        },
      },
      {
        invoiceNumber: 1104,
        customerName: 'Delta Co',
        invoiceDate: '2025-03-01',
        dueDate: '2025-03-16',
        lineItems: 'Web Design: $339',
        paid: false,
        expected: {
          'Web Design': 339,
        },
      },
      {
        invoiceNumber: 1203,
        customerName: 'Acme Corp',
        invoiceDate: '2025-02-28',
        dueDate: '2025-03-15',
        lineItems: 'Domain Renewal: $1269; Maintenance: $1176',
        paid: false,
        expected: {
          'Domain Renewal': 1269,
          'Maintenance': 1176,
        },
      },
      {
        invoiceNumber: 1005,
        customerName: 'Echo Solutions',
        invoiceDate: '2025-01-12',
        dueDate: '2025-01-27',
        lineItems: 'Web Design: $1898; Hosting: $718',
        paid: false,
        expected: {
          'Web Design': 1898,
          'Hosting': 718,
        },
      },
      {
        invoiceNumber: 1204,
        customerName: 'Acme Corp',
        invoiceDate: '2025-02-06',
        dueDate: '2025-02-21',
        lineItems: 'Consulting: $60',
        paid: false,
        expected: {
          'Consulting': 60,
        },
      },
      {
        invoiceNumber: 1204,
        customerName: 'Beta LLC',
        invoiceDate: '2025-01-01',
        dueDate: '2025-01-16',
        lineItems: 'Consulting: $1030; Maintenance: $859',
        paid: false,
        expected: {
          'Consulting': 1030,
          'Maintenance': 859,
        },
      },
      {
        invoiceNumber: 1004,
        customerName: 'Delta Co',
        invoiceDate: '2025-01-03',
        dueDate: '2025-01-18',
        lineItems: 'Domain Renewal: $1235',
        paid: false,
        expected: {
          'Domain Renewal': 1235,
        },
      },
      {
        invoiceNumber: 1201,
        customerName: 'Global Tech',
        invoiceDate: '2025-01-14',
        dueDate: '2025-01-29',
        lineItems: 'Domain Renewal: $207; Web Design: $640; Hosting: $843',
        paid: false,
        expected: {
          'Domain Renewal': 207,
          'Web Design': 640,
          'Hosting': 843,
        },
      },
      {
        invoiceNumber: 1005,
        customerName: 'FancyCorp',
        invoiceDate: '2025-02-11',
        dueDate: '2025-02-26',
        lineItems: 'Consulting: $1836; Software License: $1183',
        paid: false,
        expected: {
          'Consulting': 1836,
          'Software License': 1183,
        },
      },
      {
        invoiceNumber: 1202,
        customerName: 'Global Tech',
        invoiceDate: '2025-01-16',
        dueDate: '2025-01-31',
        lineItems: 'Consulting: $995',
        paid: false,
        expected: {
          'Consulting': 995,
        },
      },
      {
        invoiceNumber: 1102,
        customerName: 'Acme Corp',
        invoiceDate: '2025-02-01',
        dueDate: '2025-02-16',
        lineItems: 'Web Design: $1065',
        paid: false,
        expected: {
          'Web Design': 1065,
        },
      },
    ];

    test.each(testCases)(
      'parses line items for invoice #%s - %s',
      ({ invoiceNumber, customerName, invoiceDate, dueDate, lineItems, expected, paid }) => {
        const invoice = new Invoice(invoiceNumber, customerName, invoiceDate, dueDate, paid);
        invoice.setRawDescription(lineItems);

        expect(invoice.line_items).toEqual(expected);
      }
    );
  });
});
