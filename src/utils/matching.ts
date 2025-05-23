import { Invoice } from '../models/Invoice';
import { BankStatement } from '../models/BankStatement';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function llmMatch(
  transaction: BankStatement,
  invoices: Invoice[]
): Promise<Invoice[]> {


    const prompt = `
  You are a precise reconciliation assistant. Silently reason through the checklist below, then output **only** the matching invoice IDs (comma-separated) or the word "none".
  
  ──────────────── Checklist ────────────────
  
  1. Amount  
  • The transaction amount must exactly equal:
    – one invoice total, or  
    – the sum of two or more invoice totals (from the same customer, unless invoice numbers are explicitly mentioned in the description).  
  *Example:* A $2445 transaction may match a single invoice of $2445 or two invoices from the same customer of $1269 and $1176.
  
  • Do NOT match:
    – Overpayments or underpayments  
    – Amounts altered by fees, taxes, or rounding errors
  
  2. Date  
  • Transaction date must be on or after the invoice issue date  
  • Prefer matches on or before the due date, but allow past-due matches if all other criteria are met
  
  3. Customer Name  
  • Perform fuzzy matching  
  • Minor differences in case, punctuation, or spelling are acceptable  
  *Examples:* "Charlie Inc" ≈ "Charlie inc", "Global Tech" ≈ "G. Tech"
  
  4. Invoice Number in Description  
  • If the transaction description includes an invoice number, restrict the match to:
    – that specific invoice, or  
    – invoices from that customer  
  • Still apply Amount, Date, and Customer Name rules
  
  5. Line-Item Clues (Optional)  
  • Words like "Domain Renewal", "Hosting", "Consulting" can support match confidence  
  • Never override rules 1–4
  
  6. Irrelevant Transactions  
  • Do not match transactions that are:
    – Salaries, rent, SaaS tools  
    – Refunds or reversals  
    – Bank fees or processing costs
  
  7. No Guessing  
  • If any rule is unmet or uncertain, respond with: "none"
  
  ──────────────── Bank Transaction ────────────────
  ${transaction.getString()}
  
  ──────────────── Open Invoices ────────────────
  ${invoices.map(inv => inv.getString()).join('\\n\\n')}
  
  ──────────────── Response Format ────────────────
  • Comma-separated invoice IDs (e.g., \`1104\`, \`1001,1002\`)  
  • Or the single word: \`none\`
  `.trim();
  

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful assistant for invoice matching.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
  });


  console.log('lengthhhh: ', invoices.length)
  const raw = completion.choices[0].message.content?.trim() ?? '';


  if (raw.toLowerCase() === 'none') {
    return [];
  }

  const matchedIds = Array.from(
    new Set(
      raw
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0)
    )
  );

  const matchedInvoices: Invoice[] = [];
  const seen = new Set<string>();
  
  for (const inv of invoices) {
    if (matchedIds.includes(inv.id) && !seen.has(inv.id)) {
      matchedInvoices.push(inv);
      seen.add(inv.id);
    }
  }
  console.log('---------------------------------')
  console.log('matchedInvoices: ', matchedInvoices)
  console.log('seen: ', seen)
  return matchedInvoices; 
}
