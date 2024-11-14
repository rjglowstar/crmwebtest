export class MemoSummary {
    opCount!: number;
    opWeight!: number;
    lpCount!: number;
    lpWeight!: number;
    issueCount!: number;
    reciveCount!: number;
    pandingCount!: number;
    constructor() {
        this.opCount = 0;
        this.opWeight = 0;
        this.lpCount = 0;
        this.issueCount = 0;
        this.reciveCount = 0;
        this.pandingCount = 0;
    }
}