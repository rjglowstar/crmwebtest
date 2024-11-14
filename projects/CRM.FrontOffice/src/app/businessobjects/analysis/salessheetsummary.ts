export class SalesSheetSummary {
    totalPcs: number
    totalWeight: number
    totalAmt: number
    totalDcaret: number
    totalNetAmount: number
    totalBaseNetAmount: number
    avgDay: number
    avgAvailableDay: number
    avgDiscount: number
    avgBaseDiscount: number
    avgBasePerCart: number

    constructor() {
        this.totalPcs = 0;
        this.totalWeight = 0;
        this.totalAmt = 0;
        this.totalDcaret = 0;
        this.avgDay = 0;
        this.avgAvailableDay = 0;
        this.totalNetAmount = 0;
        this.totalBaseNetAmount = 0;
        this.avgDiscount = 0;
        this.avgBaseDiscount = 0;
        this.avgBasePerCart = 0;
    }
}