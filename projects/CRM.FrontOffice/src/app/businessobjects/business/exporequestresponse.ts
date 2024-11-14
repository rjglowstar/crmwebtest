import { ExpoRequests } from "../../entities";

export class ExpoRequestResponse {
    expoRequests: ExpoRequests[]
    totalCount!: number

    constructor() {
        this.expoRequests = new Array<ExpoRequests>();
    }
}

export class ExpoRequestSummary {
    totalStoneCount!: number
    pendingStoneCount!: number
    issueStoneCount!: number
    receiveStoneCount!: number
    orderStoneCount!: number

    constructor() { }
}