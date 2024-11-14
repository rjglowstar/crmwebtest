import { LabIssue } from "./labIssue";

export class LabIssueResponse {
    labIssues: LabIssue[]
    totalCount!: number

    constructor() {
        this.labIssues = [];
    }
}