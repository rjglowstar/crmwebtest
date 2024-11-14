import { PriceDNorm } from "../../entities";

export class TempPricingRequest {
    stoneId!: string;
    status!: string;
    updatedBy!: string;
    tempBasePrice: PriceDNorm;
    tempPrice: PriceDNorm;
    pricingComment!: string;
    discColorMark!: string

    constructor() {
        this.tempBasePrice = new PriceDNorm();
        this.tempPrice = new PriceDNorm();
    }
}