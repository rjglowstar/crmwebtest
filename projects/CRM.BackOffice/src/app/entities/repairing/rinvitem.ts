import { InventoryItemInclusion,  } from "../inventory/inventoryiteminclusion"
import { InventoryItemMeasurement } from "../inventory/inventoryitemmeasurement"
export class RInvItem {
    stoneId!: string
    weight!: number
    shape!: string
    color!: string
    clarity!: string
    cut!: string
    polish!: string
    symmetry!: string
    fluorescence!: string    
    inclusion: InventoryItemInclusion
    measurement: InventoryItemMeasurement

    constructor() {
        this.inclusion = new InventoryItemInclusion();
        this.measurement = new InventoryItemMeasurement();
    }
}