import { InvHistory, LeadHistory, PricingHistory } from "../../entities";

export class StoneHistory {
    leadHistories: LeadHistory[];
    invHistories: InvHistory[];
    pricingHistories: PricingHistory[];
    constructor() { 
        this.leadHistories=new Array<LeadHistory>()
        this.invHistories=new Array<InvHistory>()
        this.pricingHistories=new Array<PricingHistory>()
    }

}