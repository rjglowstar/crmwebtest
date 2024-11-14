import { Memo } from "../../entities/memo/memo";

export class MemoReceive {
    memo: Memo;
    stoneIds: string[];

    constructor() {
        this.memo = new Memo();
        this.stoneIds = new Array<string>();
    }
}