export class MemoRequestSerchCriteria {
    stoneIds!: string[]
    certificateNos!: string[]
    partyId!: string
    brokerId!: string

    constructor() {
        this.stoneIds = []
    }
}