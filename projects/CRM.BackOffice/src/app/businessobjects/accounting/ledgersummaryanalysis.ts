import { LedgerSummaryData } from "./ledgersummarydata";

export class LedgerSummaryAnalysis {
    creditData: LedgerSummaryData[];
    creditTotal!: number;
    debitData: LedgerSummaryData[];
    debitTotal!: number;
    total!: number;

    totalRecords!: number

    constructor(){
        this.creditData = [];
        this.debitData = [];
    }
}