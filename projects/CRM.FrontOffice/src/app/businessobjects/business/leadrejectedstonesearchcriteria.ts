export class LeadRejectedStoneSearchCriteria {

    fromDate!: Date | null
    toDate!: Date | null
    customerId!: string;
    leadNos!: Array<number>;
    stoneIds!: Array<string>;
    rejectionTypes: Array<string>;
    sellerId!: string;


    constructor() {
        this.rejectionTypes = new Array<string>();

    }
} 