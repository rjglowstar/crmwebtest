import { LedgerDNorm } from "../../entities/accounting/dnorm/ledgerdnorm"
import { OrderInvItem } from "../../entities/accounting/dnorm/orderinvitem"
import { IdentityDNorm } from "../../entities/inventory/identityDNorm"

export class SoldInvDNorm {
    invoiceNo!: string
    leadId!: string
    leadNumber!: string
    customer: LedgerDNorm
    broker: LedgerDNorm
    invItem:OrderInvItem
    seller: IdentityDNorm
    soldDate!: Date

    constructor() {
        this.customer = new LedgerDNorm();
        this.broker = new LedgerDNorm();
        this.invItem = new OrderInvItem();
        this.seller = new IdentityDNorm();
    }
}