export class UpdateDiamondStatus {
    invItems: Array<UpdateInvItem>
    isListed!: boolean
    isSold!: boolean

    constructor() {
        this.invItems = new Array<UpdateInvItem>();
    }
}

export class UpdateInvItem {
    serialNo!: string
    rap!: Number
    netAmount!: number
    constructor() { }

}