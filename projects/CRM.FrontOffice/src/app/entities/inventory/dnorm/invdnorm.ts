import { PriceDNorm } from "../priceDNorm";

export class InvDNorm {

    invId!: string;
    stoneId: string;
    kapan: string;
    rfid: string;
    shape: string;
    weight: number;
    color: string;
    clarity: string;
    cut: string;
    polish: string;
    symmetry: string;
    fluorescence: string;
    location: string;
    lab: string;
    certificateNo: string;
    price: PriceDNorm;
    sDiscount: number;
    fDiscount: number;
    fAmount: number;
    isHold: boolean
    isMemo: boolean
    status: string;

    constructor() {
        this.price = new PriceDNorm();
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
        this.fAmount = 0
        this.isHold = false;
        this.isMemo = false;
        this.status = "";
    }
}