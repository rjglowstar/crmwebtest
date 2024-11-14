export class SalesStatisticsSearchCriteria {
    fromDate!: Date;
    toDate!: Date;
    paymentFromDate!: Date;
    paymentToDate!: Date;
    deliveryFromDate!: Date;
    deliveryToDate!: Date;
    partyId!: string;
    status: string[];

    constructor() {
        this.status = [];
    }
}