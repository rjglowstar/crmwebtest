import { PriceDNorm } from "../../inventory/priceDNorm"
import { SupplierDNorm } from "../../supplier/dnorm/supplierdnorm"

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
    location!: string
    lab!: string
    certificateNo!: string
    certiType!: string
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
    isRejected!: boolean
    isDelivered!: boolean
    isPricingRequest!: boolean
    isMemo!: boolean
    isLabReturn!: boolean
    status!: string;
    brokerAmount!: number;
    ccRate!: number;
    ccType!: string;
    cps: string
    deliveredDate!: Date;
    diaMeter!: string;
    terms!: string;
    remark!: string;
    orderProcessDate!: Date;
    expoName!: string;
    reason!: string

    constructor() {
        this.price = new PriceDNorm();
        this.supplier = new SupplierDNorm();
        this.primarySupplier = new SupplierDNorm();
        this.viaSupplier = new SupplierDNorm();
        this.invId = "";
        this.stoneId = "";
        this.kapan = ""
        this.rfid = ""
        this.shape = ""
        this.weight = 0
        this.color = ""
        this.clarity = ""
        this.cut = ""
        this.polish = ""
        this.symmetry = ""
        this.fluorescence = ""
        this.location = ""
        this.lab = ""
        this.certificateNo = ""
        this.sDiscount = 0
        this.fDiscount = 0
        this.aDiscount = 0
        this.fAmount = 0
        this.isHold = false;
        this.isRejected = false;
        this.removeStoneReason = "";
        this.cps = "";
        this.reason = "";
    }
}
