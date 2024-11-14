import { LocationTotalClass } from ".."

export class InventorySummary {
    locationTotals: LocationTotalClass[]
    totalCount!: number
    totalHold!: number
    totalRapnetHold!: number
    totalMemo!: number
    totalLead!: number
    totalTransit!: number
    totalWeight!: number
    totalNetAmount!: number
    avgDiscount!: number
    avgPerCarat!: number
    avgBaseDiscount!: number
    avgBasePerCarat!: number
    totalBaseNetAmount!: number
    avgDay!: number
    avgAvailableDay!: number
    iAvgDay!: number
    totalPendingCount!: number
    avgPendingDiscount!: number

    constructor() {
        this.locationTotals = [];
        this.totalMemo = 0;
        this.totalLead = 0;
        this.totalCount = 0;
        this.totalHold = 0;
        this.totalRapnetHold = 0;
        this.totalWeight = 0;
        this.totalNetAmount = 0;
        this.totalTransit = 0;
        this.avgDiscount = 0;
        this.avgPerCarat = 0;
        this.avgDay = 0;
        this.avgAvailableDay = 0;
        this.iAvgDay = 0;
        this.totalPendingCount = 0;
        this.avgPendingDiscount = 0;
    }
}