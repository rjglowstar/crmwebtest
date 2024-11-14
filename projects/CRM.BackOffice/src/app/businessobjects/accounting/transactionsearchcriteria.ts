export class TransactionSearchCriteria {
    stoneIds: string[];
    certificateNos: string[];
    number!: string;
    orderNumber!: string;
    ledgerName!: string;
    ledgerGroup!: string;
    transactionType: string[];
    fromDate!: Date;
    toDate!: Date;
    showOnlyUnpaid!: boolean;
    isOverseas?: boolean;

    constructor() {
        this.stoneIds = [];
        this.certificateNos = []
        this.number = '';
        this.orderNumber = '';
        this.ledgerName = '';
        this.ledgerGroup = '';
        this.transactionType = [];
        this.fromDate = '' as any;
        this.toDate = '' as any;
        this.showOnlyUnpaid = true;
    }
}