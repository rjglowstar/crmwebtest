export class LedgerSummaryReportReq {
    ledgerName!: string;
    ledgerGroup!: Array<string>;
    fromDate!: Date | null;
    toDate!: Date | null;
    isShowZeroBalance!: boolean | null;

    constructor() {
        this.ledgerName = '';
        this.ledgerGroup = new Array<string>();
        this.fromDate = null;
        this.toDate = null;
        this.isShowZeroBalance = null;
    }
}