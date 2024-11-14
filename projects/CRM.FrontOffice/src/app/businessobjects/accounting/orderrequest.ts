import { InvItem, RequestDNorm } from "../../entities";

export class OrderRequest {
    leadId!: string
    leadNumber!: string
    party: RequestDNorm
    broker: RequestDNorm
    invItems: InvItem[]
    seller: RequestDNorm
    approvedBy: RequestDNorm
    isLocked!: boolean

    constructor() {
        this.party = new RequestDNorm();
        this.broker = new RequestDNorm();
        this.invItems = new Array<InvItem>();
        this.seller = new RequestDNorm();
        this.approvedBy = new RequestDNorm();
        this.isLocked = false;
    }
}