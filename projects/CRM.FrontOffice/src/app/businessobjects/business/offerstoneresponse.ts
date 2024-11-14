import { OfferStoneItem } from "./offerstoneitem";

export class OfferStoneResponse {
    offerStones: OfferStoneItem[];
    counts!: number;
    constructor() {
        this.offerStones = [];
    }
}