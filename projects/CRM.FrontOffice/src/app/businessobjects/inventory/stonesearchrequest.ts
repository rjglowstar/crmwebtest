export class StoneSearchRequest {
    stoneIds: string[];
    certificateNos: string[];

    constructor() {
        this.stoneIds = []
        this.certificateNos = []
    }
}