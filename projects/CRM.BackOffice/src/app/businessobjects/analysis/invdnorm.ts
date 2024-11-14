import { InventoryItemMeasurement, PriceDNorm } from "../../entities"

export class InvDNorm {
    shape!: string
    weight!: number
    color!: string
    clarity!: string
    cut!: string
    polish!: string
    symmetry!: string
    fluorescence!: string
    measurement: InventoryItemMeasurement
    price: PriceDNorm

    constructor() {
        this.measurement = new InventoryItemMeasurement();
        this.price = new PriceDNorm();
    }
}