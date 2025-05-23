import { v4 as uuidv4 } from 'uuid';

export class BankStatement {
  constructor(
    public date: string,
    public description: string,
    public amount: string,
    public id: string = uuidv4()
  ) {}

  getString(): string {
    return `BankStatement on ${this.date}\nAmount: $${this.amount}\nDescription: ${this.description}`;
  }

  static fromJSON(data: any): BankStatement {
    return new BankStatement(data.date, data.description, data.amount, data.id);
  }
}
