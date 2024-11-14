import { PriceDNorm, SupplierDNorm } from "../../entities"
import { Media } from "../../entities/inventory/dnorm/media"

export class InvItem {
  
    invId!: string
    stoneId!: string
    kapan!: string
    rfid!: string
    shape!: string
    weight!: number
    color!: string
    clarity!: string
    cut!: string
    polish!: string
    symmetry!: string
    fluorescence!: string
    cps!: string
    location!: string
    lab!: string
    certificateNo!: string
    certiType!: string
    media: Media
    price!: PriceDNorm
    supplier: SupplierDNorm
    primarySupplier: SupplierDNorm
    viaSupplier: SupplierDNorm
    sDiscount!: number
    aDiscount!: number
    fDiscount!: number
    perCarat!: number
    netAmount?: number | null;
    vowDiscount!: number;
    vowAmount!: number;
    fAmount!: number
    removeStoneReason!: string;
    isHold!: boolean
    holdBy!: string;
    isLabReturn!: boolean
    isRejected!: boolean
    isDelivered!: boolean
    isMemo!: boolean    
    status!: string;
    brokerAmount!: number;
    ccRate!: number;
    ccType!: string;
    deliveredDate!: Date;
    diaMeter!: string;
    terms!: string;
    remark!: string;
    orderProcessDate!:Date;

    constructor() {
        this.price = new PriceDNorm();
        this.media = new Media();
        this.supplier = new SupplierDNorm();
        this.primarySupplier = new SupplierDNorm();
        this.viaSupplier = new SupplierDNorm();
    }
}
