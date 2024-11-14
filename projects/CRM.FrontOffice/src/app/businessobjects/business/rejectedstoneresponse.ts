import { RejectedStone } from "../../entities";

export class RejectedStoneResponse {
    rejectedStones: RejectedStone[];
    totalCount!: number;

    constructor() {
        this.rejectedStones = [];
    }
}