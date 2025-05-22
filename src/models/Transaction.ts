export class Transaction {
    constructor(
      public date: string,
      public description: string,
      public amount: string
    ) {}


  getString(): string {
    return `Transaction on ${this.date}\nAmount: $${this.amount}\nDescription: ${this.description}`;
  }
}
  