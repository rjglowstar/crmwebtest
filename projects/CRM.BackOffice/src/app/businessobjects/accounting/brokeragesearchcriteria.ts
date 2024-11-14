export class BrokerageSearchCriteria {

    brokerId!: string;
    fromDate!: Date;
    toDate!: Date;
    showOnlyUnpaid!: boolean;

    constructor() { 
        this.fromDate = '' as any;
        this.toDate = '' as any;
        this.showOnlyUnpaid = true;
    }

}