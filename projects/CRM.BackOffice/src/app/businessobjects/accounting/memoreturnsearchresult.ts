import { Memoreturn } from "../../entities";

export class MemoReturnSearchResult {
    memoReturns: Memoreturn[]
    totalCount!: number

    constructor() { 
        this.memoReturns = [];
    }
}