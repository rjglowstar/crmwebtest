import { PricingRequest } from "../../entities";

export class PriceReqResponse {
    priceRequest: PricingRequest[];
    total!: number;

    constructor() {
        this.priceRequest = [];
    }
}