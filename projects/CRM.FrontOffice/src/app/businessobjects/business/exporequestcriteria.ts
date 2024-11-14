export class ExpoRequestCriteria {
    numbers: number[]
    sellerIds: string[];
    stoneIds: string[]
    certificateNos: string[]
    status: string[]

    constructor() {
        this.sellerIds = [];
        this.numbers = [];
        this.stoneIds = [];
        this.certificateNos = [];
        this.status = [];
    }
}
