export class InvHistorySearchCriteria {
    stoneId!: string;
    action!: string;
    description!: string;
    userName!: string;
    fromDate!: Date | null;
    toDate!: Date | null;
    
    constructor() { 
    }
}