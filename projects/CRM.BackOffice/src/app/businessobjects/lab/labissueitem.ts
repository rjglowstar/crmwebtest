import { PriceDNorm } from "../../entities/inventory/priceDNorm"

export class LabIssueItem {
    stoneId!: string
    kapan!: string
    shape!: string
    weight!: number
    color!: string
    length!: number
    width!: number
    height!: number
    clarity!: string
    cut!: string
    polish!: string
    symmetry!: string
    fluorescence!: string
    basePrice: PriceDNorm
    status!: string 
    service!: string 
    isReceived!: boolean
    receiveDate!: Date | null
    recheckReason: string[]
    IsRepairing!: boolean
    isLabResultFound!: boolean
    oldCertificateNo!: string

    constructor() {
        this.basePrice = new PriceDNorm();
        this.recheckReason = [];
    }
}