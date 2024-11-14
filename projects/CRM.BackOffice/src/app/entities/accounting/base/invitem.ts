import { PriceDNorm } from "../../inventory/priceDNorm"
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
    supplier: any
    sDiscount!: number
    aDiscount!: number
    fDiscount!: number
    fAmount!: number
    perCarat!:number
    removeStoneReason!: string;
    isHold!: boolean
    holdBy!: string;
    isRejected!: boolean
    heldBy!: string;
    status!: string;
    ccRate!: number;
    ccType!: string;    
    netAmount?: number | null;    
    cps: string
    diaMeter!: string;
    terms!: string;
    remark!: string;
    comment!: string;

    constructor() {
        this.price = new PriceDNorm();        
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
    }
}
