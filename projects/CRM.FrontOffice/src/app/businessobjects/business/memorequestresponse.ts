import { MemoRequest } from "../../entities";

export class MemoRequestResponse {
    memoRequests: MemoRequest[]
    totalCount!: number

    constructor() {
        this.memoRequests = new Array<MemoRequest>();
    }
}