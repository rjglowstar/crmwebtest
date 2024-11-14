import { PriceDNorm } from "../../entities";

export class MemoInventoryPrice {
    
    stoneId!: string
    price: PriceDNorm
    
    constructor() {
        this.price = new PriceDNorm()
    }
}