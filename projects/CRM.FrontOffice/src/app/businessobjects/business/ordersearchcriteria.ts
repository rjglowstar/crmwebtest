
export class OrderSearchCriteria {
    fromDate!: Date | null
    toDate!: Date | null
    sellerId!: string;
    customerId!: string;
    stoneIds: Array<string> = new Array<string>();
    certificateNos: Array<string> = new Array<string>();
    brokerId!: string;
    leadNos: Array<number> = new Array<number>();

    constructor() { }
}