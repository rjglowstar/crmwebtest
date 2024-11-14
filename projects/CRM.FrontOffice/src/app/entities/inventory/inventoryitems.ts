import { InventoryItemInclusion } from "./inventoryiteminclusion"
import { InventoryItemMeasurement } from "./inventoryitemmeasurement"
import { PriceDNorm } from "./priceDNorm"
import { IdentityDNorm } from "./identityDNorm"
import { Media } from "./media"
import { BaseEntity } from "shared/enitites"
import { SupplierDNorm } from "../supplier/dnorm/supplierdnorm"

export class InventoryItems extends BaseEntity {
    stoneId!: string
    kapan!: string
    article!: string
    rfid!: string
    grade!: string
    shape!: string
    shapeRemark!: string
    weight!: number
    color!: string
    clarity!: string
    cut!: string
    polish!: string
    symmetry!: string
    fluorescence!: string
    cps!: string
    strLn!: number
    lrHalf!: number
    location!: string
    status!: string //Stock,Grading,Lab,Pricing,Transit,Sold,InSale,Mfg,Memo
    leadStatus!: string
    isCPBlocked!: boolean //Other Platform Block
    blockedClients!: string[] //Specific Customer Block (Block By Customer or Block For Customer By Admin)
    lab!: string
    certificateNo!: string
    certiType!: string
    inscription!: string
    comments!: string
    bgmComments!: string
    reasonToRemove!: string
    isHold: boolean
    holdBy!: string
    isRapnetHold: boolean
    isPricingRequest: boolean
    isMemo: boolean
    isLabReturn: boolean
    isTypeTwo: boolean
    typeA!: string
    hasTask: boolean = false;
    inclusion: InventoryItemInclusion
    measurement: InventoryItemMeasurement
    labSendDate!: Date | null
    labReceiveDate!: Date | null
    marketSheetDate!: Date | null
    holdDate!: Date | null
    soldDate!: Date | null
    basePrice: PriceDNorm
    price: PriceDNorm
    supplier: SupplierDNorm
    identity: IdentityDNorm
    availableDays!: number
    holdDays!: number
    media: Media
    boxSerialNo!: string
    kapanOrigin!: string
    pricingComment!: string;
    discColorMark!: string;
    isInExpo!: boolean;
    expoName!: string;
    priceUpdatedAt!: Date | null;
    isSpecialStone!: boolean;
    isDOrder!: boolean;

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
        this.isTypeTwo = false;
        this.media = new Media();
    }
}