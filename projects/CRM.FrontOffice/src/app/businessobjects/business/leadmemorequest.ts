import { InvItem, RequestDNorm } from "../../entities";

export class LeadMemoRequest {
    leadId!: string;
    party: RequestDNorm;
    broker: RequestDNorm
    seller: RequestDNorm;
    memoStoneIds!: Array<InvItem>;
    ident!: string;
    rate!: number

    constructor() {
        this.party = new RequestDNorm();
        this.seller = new RequestDNorm();
        this.broker = new RequestDNorm();
        this.memoStoneIds = new Array<InvItem>();
    }
}

