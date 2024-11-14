import { KapanSummaryDNorm } from "./kapansummarydnorm"

export class SummaryDNorm {
    kapan!: string
    previousSummary: KapanSummaryDNorm
    arrival: KapanSummaryDNorm
    total: KapanSummaryDNorm
    inwardMemo: KapanSummaryDNorm
    labDiff: KapanSummaryDNorm
    lab: KapanSummaryDNorm
    inTransit: KapanSummaryDNorm
    memo: KapanSummaryDNorm
    stock: KapanSummaryDNorm
    order: KapanSummaryDNorm
    delivered: KapanSummaryDNorm
    inwardReturn: KapanSummaryDNorm
    error: KapanSummaryDNorm
    balance: KapanSummaryDNorm
    isFinished!: boolean
    isConfirm!: boolean

    constructor() {
        this.previousSummary = new KapanSummaryDNorm();
        this.arrival = new KapanSummaryDNorm();
        this.total = new KapanSummaryDNorm();
        this.inwardMemo = new KapanSummaryDNorm();
        this.labDiff = new KapanSummaryDNorm();
        this.lab = new KapanSummaryDNorm();
        this.inTransit = new KapanSummaryDNorm();
        this.memo = new KapanSummaryDNorm();
        this.stock = new KapanSummaryDNorm();
        this.order = new KapanSummaryDNorm();
        this.delivered = new KapanSummaryDNorm();
        this.inwardReturn = new KapanSummaryDNorm();
        this.error = new KapanSummaryDNorm();
        this.balance = new KapanSummaryDNorm();
    }
}