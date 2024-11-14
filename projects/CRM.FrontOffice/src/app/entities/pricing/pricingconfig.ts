import { BaseEntity } from "shared/enitites";

export class PricingConfig extends BaseEntity {
    expirationDay!: number | null;
    baseDiscountDifference!: number | null;

    constructor() {
        super();
    }
}