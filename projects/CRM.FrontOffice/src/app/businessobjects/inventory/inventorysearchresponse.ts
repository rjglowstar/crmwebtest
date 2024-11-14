import { InventoryItems } from '../../entities';
import { LocationTotalClass } from './locationtotalclass';

export class InventorySearchResponse {
    inventories: InventoryItems[]
    locationTotals: LocationTotalClass[]
    totalCount!: number
    totalHold!: number
    totalRapnetHold!: number
    totalMemo!: number
    totalLead!: number
    totalWeight!: number
    totalNetAmount!: number

    avgDiscount!: number
    avgPerCarat!: number

    avgDay!: number
    avgAvailableDay!: number
    iAvgDay!: number

    totalPendingCount!: number
    avgPendingDiscount!: number

    constructor() {
        this.inventories = [];
        this.locationTotals = [];

        this.totalCount = 0;
        this.totalHold = 0;
        this.totalRapnetHold = 0;
        this.totalWeight = 0;
        this.totalNetAmount = 0;
        this.avgDiscount = 0;
        this.avgPerCarat = 0;
        this.avgDay = 0;
        this.avgAvailableDay = 0;
        this.iAvgDay = 0;
    }
}