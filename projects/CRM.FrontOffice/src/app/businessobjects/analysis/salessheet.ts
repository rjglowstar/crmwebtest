import { BrokerDNrom, InventoryItemInclusion, InventoryItemMeasurement, InvItem } from "../../entities"
import { PriceDNorm } from "../../entities"

export class SalesSheet extends InvItem {
    grade!: string
    seller!: string
    broker!: BrokerDNrom;
    leadNo!: number
    basePrice!: PriceDNorm
    customerName!: string
    customerCompany!: string
    marketSheetDate!: Date | null
    orderDate!: Date | null
    soldDate!: Date | null
    inclusion: InventoryItemInclusion
    measurement: InventoryItemMeasurement
    holdDate!: Date | null
    holdDays!: number
    availableDays!:number
    typeA!: string
    discColorMark!:string
    stoneCount: number
    totalAmount: number
    totalVOWDiscAmount: number
    totalPayableAmount: number
    pricingComment!: string

    constructor() {
        super();
        this.inclusion = new InventoryItemInclusion();
        this.measurement = new InventoryItemMeasurement();
        this.broker = new BrokerDNrom();
        this.stoneCount = 0;
        this.totalAmount = 0;
        this.totalVOWDiscAmount = 0;
        this.totalPayableAmount = 0;
    }
}