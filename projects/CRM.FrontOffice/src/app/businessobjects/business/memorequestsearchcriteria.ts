export class MemoRequestSerchCriteria {
    stoneIds!: string[]
    certificateNos!: Array<string>
    customerId!: string
    sellerId!: string
    brokerId!: string

    constructor() {
        this.stoneIds = []
    }
}