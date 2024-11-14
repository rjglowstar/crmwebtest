import { QcRequest } from "../../entities";

export class QcRequestResponse {
    qcRequests: QcRequest[]
    totalCount!: number

    constructor() {
        this.qcRequests = new Array<QcRequest>();
    }
}