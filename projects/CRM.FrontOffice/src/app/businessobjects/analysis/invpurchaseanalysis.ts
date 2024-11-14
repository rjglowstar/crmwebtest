import { PriceDNorm } from "../../entities"

export class InvPurchaseAnalysis {
    id!: string
    shape!: string
    weight!: number
    color!: string
    clarity!: string
    cut!: string
    polish!: string
    sym!: string
    fluo!: string
    kPrice: PriceDNorm
    mPrice: PriceDNorm
    sAVGDays: number;
    mAVGDays: number;
    constructor() {
        this.kPrice = new PriceDNorm();
        this.mPrice = new PriceDNorm();
        this.sAVGDays = 90;
        this.mAVGDays = 90;
    }
}