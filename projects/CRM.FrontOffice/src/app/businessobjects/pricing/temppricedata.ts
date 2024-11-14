import { PriceDNorm } from "../../entities";

export class TempPriceData {
    stoneId!: string;
    status!: string;
    updatedBy!: string;
    tempPrice: PriceDNorm;
    updatedAt!: string;

    constructor() {
        this.tempPrice = new PriceDNorm();
    }
}