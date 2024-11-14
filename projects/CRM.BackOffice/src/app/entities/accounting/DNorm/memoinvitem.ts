import { InventoryItemMeasurement } from "../../inventory/inventoryitemmeasurement"
import { PriceDNorm } from "../../inventory/priceDNorm"

export class MemoInvItem {
    invId!: string
    stoneId!: string
    kapan!: string
    shape!: string
    weight!: number
    color!: string
    clarity!: string
    cut!: string
    polish!: string
    symmetry!: string
    fluorescence!: string
    length!: number
    width!: number
    height!: number
    lab!: string
    certificateNo!: string
    certiType!: string
    price!: PriceDNorm
    isHeld!: boolean
    isReturned!: boolean
    returnDate!: Date | null
    isPurchased!: boolean
    purchaseDate!: Date | null
    inWardFlag!: string
    fluorescenceColor!: string
    keytoSymbols!: string
    measurement: InventoryItemMeasurement
    bgmComments!: string
    inscription!: string
    comments!: string
    srNo!: number

    constructor() {
        this.price = new PriceDNorm();
        this.measurement = new InventoryItemMeasurement();
    }
}