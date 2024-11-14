import { SafeResourceUrl } from "@angular/platform-browser";
import { Media } from "../../entities/inventory/dnorm/media";
import { InventoryItemMeasurement } from "../../entities/inventory/inventoryitemmeasurement";
import { InventoryItemInclusion } from "../../entities/inventory/inventoryiteminclusion";
import { PriceDNorm } from "../../entities/inventory/dnorm/priceDNorm";

export class InvDetailData {
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
    lrHalf!: string
    measurement: InventoryItemMeasurement
    inclusion: InventoryItemInclusion
    location: string;
    lab: string;
    labReceiveDate!: Date;
    certificateNo: string;
    price: PriceDNorm;
    media: Media;
    isLabReturn!: boolean;
    isHold: boolean
    holdBy: string;
    createdDate!: Date
    imageURL?: string | SafeResourceUrl
    videoURL?: string | SafeResourceUrl
    certiURL?: string | SafeResourceUrl
    otherImageBaseURL?: string | SafeResourceUrl
    kapanOrigin!: string
    comments!: string
    bgmComments!: string
    typeA!: string
    //extra
    discount!: string;
    netAmount!: string;
    perCarat!: string;
    marketSheetDate!: Date
    diameter!: string

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
        this.holdBy = "";
        this.comments = "";
        this.bgmComments = "";
        this.typeA = "";
    }
}