export class ExportRequestCriteria {
    stoneIds: string[];
    certificateNos: string[];
    requestedBy: string[];
    location: string[];

    constructor() {
        this.stoneIds = [];
        this.certificateNos = [];
        this.requestedBy = [];
        this.location = [];
    }
}