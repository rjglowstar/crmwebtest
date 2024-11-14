import { InvHistory } from "../../entities";

export class InvHistoryResponse {
    invHistories: InvHistory[]
    counts!: number

    constructor() {
        this.invHistories = [];
    }
}