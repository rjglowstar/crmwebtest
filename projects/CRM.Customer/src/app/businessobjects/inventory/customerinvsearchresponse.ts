import { InvDetailData } from "./invdetaildata";

export class CustomerInvSearchResponse {
    inventories: InvDetailData[]
    totalCount!: number

    constructor() {
        this.inventories = [];
    }
}