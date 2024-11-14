import { LeadHistory } from "../../entities";

export class LeadHistoryResponse {
    leadHistories: LeadHistory[]
    counts!: number

    constructor() {
        this.leadHistories = [];
    }
}