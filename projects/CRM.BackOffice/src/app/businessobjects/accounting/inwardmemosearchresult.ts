import { InWardMemo } from "../../entities";

export class InWardMemoSearchResult {
    inWardMemos: InWardMemo[]
    totalCount!: number

    constructor() { 
        this.inWardMemos = [];
    }
}