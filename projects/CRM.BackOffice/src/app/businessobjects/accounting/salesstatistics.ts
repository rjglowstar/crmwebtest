import { LedgerDNorm } from "../../entities/accounting/dnorm/ledgerdnorm";
export class SalesStatistics {
    transactionId!: string;
    transactionNo!: string;
    refNumber!: string;
    partyLedger!: LedgerDNorm;
    broker!: LedgerDNorm;
    createdDate!: Date;
    transactionDate!: Date | null;
    dueDate!: Date | null;
    amount!: number;
    additionalAmount!: number
    shippingCharge!: number
    netTotal!: number;
    ccAmount!: number;
    ccType!: string;
    paidAmount!: number;
    receiptTransactionId!: string;
    receiptTransactionNo!: string;
    receiptType!: string;
    receiptNetTotal!: number;
    status!: string;
    advancePaymentAmount!: number;
    deliveryDate!: Date | null
    paymentDate!: Date | null

    constructor() {
        this.partyLedger = new LedgerDNorm();
    }
}