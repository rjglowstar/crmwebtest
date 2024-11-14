import { Repairing } from "../../entities";

export class RepairingResponse {
    repairing: Repairing[];
    totalCount!: number;

    constructor() {
        this.repairing = [];
    }
}