import { LedgerSummary } from "../../entities";

export class LedgerSummaryReportRes {
    summary!: LedgerSummary[];
    totalCount!: number;
    creditTotal!: number;
    debitTotal!: number;
    totalAmount!: number;

    constructor() {
        this.summary = [];
    }
}