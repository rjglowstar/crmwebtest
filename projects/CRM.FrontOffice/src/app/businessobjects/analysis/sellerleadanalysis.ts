import { SystemUserDNorm } from "../../entities"

export class SellerLeadAnalysis {
    seller!: SystemUserDNorm
    createdLeads!: number
    createdStones!: number
    createdWeight!: number
    createdAmt!: number
    wonLeads!: number
    wonStones!: number
    wonWeight!: number
    wonAmt!: number
    rejectedLeads!: number
    rejectedStones!: number
    rejectedWeight!: number
    rejectedAmt!: number

    constructor() {
        this.seller = new SystemUserDNorm();
    }
}