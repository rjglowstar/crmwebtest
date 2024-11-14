import { PriceDNorm } from "../../entities";

export class RapUploadData {
    stoneId!: string;
    basePrice!: PriceDNorm;
    price!: PriceDNorm;
    supplierCode!: string;

    constructor() {
        this.basePrice = new PriceDNorm();
        this.price = new PriceDNorm();
    }
}