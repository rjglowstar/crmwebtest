import { ExportRequest } from "../../entities";

export class ExportRequestResponse {
    exportRequests: ExportRequest[];
    totalCount!: number;

    constructor() {
        this.exportRequests = [];
    }
}