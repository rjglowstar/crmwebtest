import { LedgerDNorm } from "../../entities";

export class BalanceSheet {
    ledgerGroup!: string;
    ledgerNature!: string;
    fromLedger!: LedgerDNorm;
    toLedger!: LedgerDNorm;
    transactionType!: string;
    cCtype!: string;
    amount: number;

    constructor() {
        this.amount = 0.00;
    }
}