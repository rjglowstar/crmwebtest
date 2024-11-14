import { LeadRejectedOfferList } from "./leadrejectedofferlist";

export class LeadRejectedStoneResponse {
    leadRejectedOffers: LeadRejectedOfferList[];
    totalCount!: number;

    constructor() {
        this.leadRejectedOffers = [];
    }
}