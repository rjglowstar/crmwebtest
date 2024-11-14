export class LeadDetailSearchCriteria {
    fromDate!: Date | null
    toDate!: Date | null
    sellerId!: string;
    customerId!: string;
    leadNos!: Array<number>;
    stoneIds!: Array<string>;
    certificateNos!: Array<string>;
    isOnline: boolean;
    isDoNotRejected: boolean;
    leadStatus: Array<string>;
    expoName!:string;

    constructor() {
        this.isOnline = null as any;
        this.isDoNotRejected = true;
        this.leadStatus = new Array<string>();
    }
}
