export class LabIssueSearchCriteria {
    stoneIds!: string[]
    public from!: Date;
    public to!: Date

    constructor() {
        this.stoneIds = []
    }
}