import { BaseEntity } from "shared/enitites"
import { IdentityDNorm, InventoryItemInclusion, InventoryItemMeasurement, PriceDNorm, StoneOrgDNorm } from "../../entities"

export class GradingMaster extends BaseEntity {
    stoneId!: string
    kapan!: string
    article!: string
    grade!: string
    shape!: string
    weight!: number
    color!: string
    clarity!: string
    cut!: string
    polish!: string
    symmetry!: string
    fluorescence!: string
    strLn!: number
    lrHalf!: number
    lab!: string
    comments!: string
    bgmComments!: string
    inclusion: InventoryItemInclusion
    measurement: InventoryItemMeasurement
    basePrice: PriceDNorm
    stoneOrg: StoneOrgDNorm
    identity: IdentityDNorm
    rapVer!: string
    createdDate!: Date
    certificateNo!: string

    constructor() {
        super();
        this.inclusion = new InventoryItemInclusion();
        this.measurement = new InventoryItemMeasurement();
        this.basePrice = new PriceDNorm();
        this.stoneOrg = new StoneOrgDNorm();
        this.identity = new IdentityDNorm();
    }
}