import { InventoryItemInclusion } from "./inventoryiteminclusion"
import { InventoryItemMeasurement } from "./inventoryitemmeasurement"
import { PriceDNorm } from "./dnorm/priceDNorm"
import { IdentityDNorm } from "./dnorm/identityDNorm"
import { Media } from "./dnorm/media"
import { BaseEntity } from "shared/enitites"
import { SupplierDNorm } from "../organization/dnorm/supplierdnorm"

export class InventoryItems extends BaseEntity {
    stoneId!: string
    kapan!: string
    article!: string
    rfid!: string
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
    location!: string
    status!: string //Stock,Grading,Lab,Pricing,Transit,Sold,InSale,Mfg,Memo
    isCPBlocked!: boolean //Other Platform Block
    blockedClients!: string[] //Specific Customer Block (Block By Customer or Block For Customer By Admin)
    lab!: string
    certificateNo!: string
    certiType!: string
    inscription!: string
    comments!: string
    bgmComments!: string
    reasonToRemove!: string
    holdBy!: string
    isHold: boolean
    isRapnetHold: boolean
    isPricingRequest: boolean
    isMemo: boolean
    isLabReturn: boolean
    hasTask: boolean = false;
    inclusion: InventoryItemInclusion
    measurement: InventoryItemMeasurement
    labSendDate!: Date | null
    labReceiveDate!: Date | null
    marketSheetDate!: Date | null
    holdDate!: Date | null
    basePrice: PriceDNorm
    price: PriceDNorm
    supplier!: SupplierDNorm
    identity: IdentityDNorm
    availableDays!: number
    holdDays!: number
    media: Media
    boxSerialNo!: string
    kapanOrigin!: string

    constructor() {
        super();
        this.inclusion = new InventoryItemInclusion();
        this.measurement = new InventoryItemMeasurement();
        this.basePrice = new PriceDNorm();
        this.price = new PriceDNorm();
        this.supplier = new SupplierDNorm();
        this.identity = new IdentityDNorm();
        this.blockedClients = [];
        this.isHold = false;
        this.isRapnetHold = false;
        this.isPricingRequest = false;
        this.isMemo = false;
        this.isCPBlocked = false;
        this.isLabReturn = true;
        this.media = new Media();
    }
}