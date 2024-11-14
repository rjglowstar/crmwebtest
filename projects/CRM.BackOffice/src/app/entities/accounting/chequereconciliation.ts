import { BaseEntity } from "shared/enitites";
import { LedgerDNorm } from "./dnorm/ledgerdnorm";

export class ChequeReconciliation extends BaseEntity {
    transactionId!: string
    transactionNumber!: string
    fromLedger: LedgerDNorm
    toLedger: LedgerDNorm
    netTotal?: number | null
    chequeNo!: string
    chequeDate!: Date
    isReturn: boolean
    returnDate!: Date
    isCleared: boolean
    clearedDate!: Date

    constructor() {
        super();
        this.fromLedger = new LedgerDNorm();
        this.toLedger = new LedgerDNorm();
        this.isReturn = false;
        this.isCleared = false;
    }
}