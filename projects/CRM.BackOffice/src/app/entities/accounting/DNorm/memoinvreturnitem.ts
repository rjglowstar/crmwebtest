import { PriceDNorm } from "../../inventory/priceDNorm"

export class MemoInvReturnItem {
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
    price!: PriceDNorm
    declaration!: string
    inwardMemoNo!: string
    inwardMemoDate!: Date
    srNo!: number

    constructor() {
        this.price = new PriceDNorm();
    }
}