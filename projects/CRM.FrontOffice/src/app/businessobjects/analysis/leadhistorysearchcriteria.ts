export class LeadHistorySearchCriteria {
    leadNos!: number[];
    action!: string;
    description!: string;
    brokerId!: string;
    sellerId!: string;
    companyName!: string[];
    fromDate!: Date | null;
    toDate!: Date | null;

    constructor() {

    }
}