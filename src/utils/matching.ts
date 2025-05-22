import { Invoice } from '../models/Invoice';
import { Transaction } from '../models/Transaction';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function llmMatch(
  transaction: Transaction,
  invoices: Invoice[]
): Promise<Invoice[]> {
  const prompt = `
You are a helpful assistant for an accounting team.

Here is a bank transaction:
${transaction.getString()}

And here are open invoices:
${invoices.map((inv) => inv.getString()).join('\n\n')}

Which invoice(s) is this transaction most likely paying for?

👉 Respond ONLY with invoice number(s) separated by commas (e.g., "1202, 1203"), or "none" if there's no match.
Do not include any explanation.
`.trim();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: 'You are a helpful assistant for invoice matching.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
  });

  console.log(completion)

  const raw = completion.choices[0].message.content?.trim() ?? '';

  if (raw.toLowerCase() === 'none') {
    return [];
  }

  const matchedNumbers = Array.from(
    new Set(
      raw
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id))
    )
  );

  if (matchedNumbers.length === 0) {
    console.warn('LLM response did not contain valid invoice numbers:', raw);
    return [];
  }

  // Return unique invoice objects by invoice_number
  const matchedInvoices: Invoice[] = [];
  const seen = new Set<number>();

  for (const inv of invoices) {
    if (matchedNumbers.includes(inv.invoice_number) && !seen.has(inv.invoice_number)) {
      matchedInvoices.push(inv);
      seen.add(inv.invoice_number);
    }
  }

  return matchedInvoices;
}
