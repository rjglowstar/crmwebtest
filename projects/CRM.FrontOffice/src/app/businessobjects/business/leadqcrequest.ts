import { InvItem, RequestDNorm } from "../../entities";

export class LeadQcRequest {
    leadId!: string;
    leadNo!: string;
    party: RequestDNorm;
    seller: RequestDNorm;
    qcStoneIds!: Array<InvItem>;
    ident!: string;
    rate!: number

    constructor() {
        this.party = new RequestDNorm();
        this.seller = new RequestDNorm();
        this.qcStoneIds = new Array<InvItem>();
    }
}

