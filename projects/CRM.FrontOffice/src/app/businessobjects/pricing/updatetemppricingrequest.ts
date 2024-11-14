import { PriceDNorm } from "../../entities";

export class UpdateTempPricingRequest {
    stoneId!: string;
    tempBasePrice: PriceDNorm;
    tempPrice: PriceDNorm;
    isValid!: boolean | null;
    updatedBy!: string;
    pricingComment!: string
    expiryDate!: Date

    canUpdateColor!: boolean
    discColorMark!: string

    constructor() {
        this.tempBasePrice = new PriceDNorm();
        this.tempPrice = new PriceDNorm();
    }
}