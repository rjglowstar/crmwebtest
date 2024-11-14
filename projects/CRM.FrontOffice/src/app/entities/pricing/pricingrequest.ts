import { TempPricing } from "./temppricing";

export class PricingRequest extends TempPricing {
    status!: string
    expiryDate!: Date
    requestedBy!: string

    constructor() {
        super();
    }
}