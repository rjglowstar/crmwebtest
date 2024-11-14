import { Memo } from "../../entities";
export class MemoResponse {
    memos: Memo[] = [];
    totalCount!: number;
    opCount!: number;
    opWeight!: number;
    lpCount!: number;
    lpWeight!: number;
    issueCount!: number;
    reciveCount!: number;
    pandingCount!: number;
    constructor() {
    }
}