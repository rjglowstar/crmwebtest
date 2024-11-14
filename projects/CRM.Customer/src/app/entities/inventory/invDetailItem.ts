import { InventoryItemInclusion, InventoryItemMeasurement, PriceDNorm } from "../../entities";
import { Media } from "./dnorm/media";
export class InvDetailItem {
    invId: string;
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
    measurement: InventoryItemMeasurement
    inclusion: InventoryItemInclusion
    location: string;
    lab: string;
    certificateNo: string;
    price: PriceDNorm;
    media:Media
    isHold: boolean
    holdBy: string;
    curBidDisc!: string;
    createdDate!: Date

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
        this.measurement = new InventoryItemMeasurement();
        this.inclusion = new InventoryItemInclusion();
        this.location = ""
        this.lab = ""
        this.certificateNo = ""
        this.media = new Media();
        this.isHold = false;
        this.holdBy = ""
    }
}