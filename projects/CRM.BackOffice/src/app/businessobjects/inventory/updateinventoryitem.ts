import { InventoryItemInclusion } from "../../entities/inventory/inventoryiteminclusion"
import { InventoryItemMeasurement } from "../../entities/inventory/inventoryitemmeasurement"

export class UpdateInventoryItem {
    stoneId!: string
    article!: string
    shape!: string
    weight!: number
    color!: string
    clarity!: string
    cut!: string
    polish!: string
    symmetry!: string
    fluorescence!: string
    location!: string
    isCPBlocked!: boolean //Other Platform Block
    lab!: string
    certificateNo!: string
    inscription!: string
    comments!: String
    bgmComments!: string
    inclusion: InventoryItemInclusion
    measurement: InventoryItemMeasurement

    constructor() {
        this.inclusion = new InventoryItemInclusion();
        this.measurement = new InventoryItemMeasurement();
    }
}