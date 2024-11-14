
export class LedgerSummaryCriteria {
    ledgerId!: string;
    fromDate!: Date;
    toDate!: Date;

    constructor() {
        this.toDate = new Date();
        this.fromDate = new Date(new Date().setDate(this.toDate.getDate() - 90));
    }
}