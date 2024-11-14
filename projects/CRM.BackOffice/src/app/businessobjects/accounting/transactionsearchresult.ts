import { Transaction } from "../../entities";

export class TransactionSearchResult {
    transactions: Transaction[]
    totalCount!: number

    constructor() {
        this.transactions = [];
    }
}