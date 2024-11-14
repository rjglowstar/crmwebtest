import { BaseEntity } from "shared/enitites";
import { PaymentDetail } from "./dnorm/paymentdetail";
import { LedgerDNorm } from "./dnorm/ledgerdnorm";
import { PackingItem } from "./dnorm/packingitem";
import { TransactionDetail } from "./dnorm/transactiondetail";
import { TransactionItem } from "./dnorm/transactionitem";
import { ContraVoucherDetail } from "./dnorm/contravoucherdetail";

export class Transaction extends BaseEntity {
    number!: string
    refNumber!: string
    fromLedger!: LedgerDNorm
    toLedger!: LedgerDNorm
    transactionType!: string
    transactionDate!: Date
    items!: TransactionItem[]
    packingList!: PackingItem[]
    note!: string
    amount: number = 0
    discount: number = 0
    taxAmount: number = 0
    addAmount: number = 0
    netTotal: number = 0
    tdsAmount: number = 0
    tcsAmount: number = 0
    paidAmount: number = 0
    ccAmount: number = 0
    insuranceCharge: number = 0;
    transactionDetail: TransactionDetail
    contraVoucherDetail: ContraVoucherDetail
    paymentDetail: PaymentDetail
    invPurchaseStatus!: string
    isLocked!: boolean
    paidDate!: Date
    relatedChargeIds!: { [key: string]: string };

    constructor() {
        super();
        this.fromLedger = new LedgerDNorm();
        this.toLedger = new LedgerDNorm();
        this.items = new Array<TransactionItem>();
        this.packingList = new Array<PackingItem>();
        this.transactionDetail = new TransactionDetail();
        this.contraVoucherDetail = new ContraVoucherDetail();
        this.paymentDetail = new PaymentDetail();
        this.relatedChargeIds = {};
        this.isLocked = false;
    }
}