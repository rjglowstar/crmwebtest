import { PriceDNorm } from "../../entities/inventory/priceDNorm";

export class TempPendingPricing {

    stoneId!: string
    tempPrice: PriceDNorm

    constructor() {
        this.tempPrice = new PriceDNorm();
    }
}