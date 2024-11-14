import { BaseEntity } from "shared/enitites";
import { IdentityDNorm } from "../inventory/identityDNorm";
import { LedgerDNorm } from "./dnorm/ledgerdnorm";
import { OrderInvItem } from "./dnorm/orderinvitem";

export class OrderItem extends BaseEntity {
    transactionNo!: string
    transactionId!: string
    transactionDate!: string
    invoiceNo!: string
    leadId!: string
    leadNumber!: string
    party: LedgerDNorm
    broker: LedgerDNorm
    invItem: OrderInvItem
    avgDays?: number | null
    seller: IdentityDNorm
    approvedBy: IdentityDNorm
    isDelivered: boolean
    deliveredDate!:Date
    takenBy!:string
    docketNo!:string
    logisticName!:string
    isLocked!: boolean

    constructor() {
        super();
        this.party = new LedgerDNorm();
        this.broker = new LedgerDNorm();
        this.invItem = new OrderInvItem();
        this.seller = new IdentityDNorm();
        this.approvedBy = new IdentityDNorm();
        this.isDelivered = false;
    }
}