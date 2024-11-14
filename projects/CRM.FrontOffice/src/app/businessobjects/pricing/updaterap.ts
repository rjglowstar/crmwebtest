import { RapPrice } from "shared/enitites";

export class UpdateRap {
    rapPrice: RapPrice[];
    stoneIds: string[];

    constructor() {
        this.rapPrice = [];
        this.stoneIds = [];
    }
}