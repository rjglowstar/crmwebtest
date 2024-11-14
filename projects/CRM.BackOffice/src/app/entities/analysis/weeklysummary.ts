import { BaseEntity } from "shared/enitites"
import { SummaryDNorm } from "./summarydnorm"

export class WeeklySummary extends BaseEntity {
    summaryNo!: number
    isSaved!: boolean
    startDate!: Date
    endDate!: Date
    summary: SummaryDNorm[]
    totalPcs!: number
    totalWeight!: number

    constructor() {
        super();
        this.summary = new Array<SummaryDNorm>();
    }
}