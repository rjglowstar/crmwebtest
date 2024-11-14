export class LeadSearchCriteria {
    fromDate!: Date | null
    toDate!: Date | null
    sellerId!: string;
    customerId!: string;
    leadNos!: Array<number>;
    certificateNos!: Array<string>;
    stoneIds!: Array<string>;
    isFilter: boolean;
    isDoNotRejected: boolean;
    expoName!: string;
    leadPlatform?: boolean;

    constructor() {
        this.isFilter = false;
        this.isDoNotRejected = true;
        this.leadPlatform = null as any;
    }
}