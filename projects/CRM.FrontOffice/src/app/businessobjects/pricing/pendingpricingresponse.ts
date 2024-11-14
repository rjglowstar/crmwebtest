import { PendingPricing } from "../../entities/pricing/pendingpricing"

export class PendingPricingResponse {
    pendingPricings: PendingPricing[]

    totalCount!: number
    totalWeight!: number
    avgDiscount!: number

    constructor() {
        this.pendingPricings = []
     }
}