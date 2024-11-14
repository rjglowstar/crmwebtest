export class HoldInventoryItems {
    stoneId!: string
    isHold: boolean
    holdBy: string
    holdDate!: Date | null
    holdDays!: number
    updatedAt!: Date

    constructor() {
        this.isHold = false;
        this.holdBy = "";
    }
}