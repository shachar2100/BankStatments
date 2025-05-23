import { supabase } from '../lib/supabaseClient';
import { BankStatement } from '../models/BankStatement';


export async function getBankstatement(id: string): Promise<BankStatement | null> {
    const { data, error } = await supabase
      .from('bank_statement')
      .select('*')
      .eq('id', id)
      .single();
  
    if (error || !data) {
      console.error('BankStatement not found or error:', error?.message);
      return null;
    }
  
    return new BankStatement(data.date, data.description, data.amount, data.id);
  }
  