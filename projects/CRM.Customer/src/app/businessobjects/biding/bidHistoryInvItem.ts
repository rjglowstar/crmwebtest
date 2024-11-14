import { InventoryItemInclusion, InventoryItemMeasurement, PriceDNorm } from "../../entities";
import { Media } from "../../entities/inventory/dnorm/media";

export class BidHistoryInvItem {
    invId!: string;
    stoneId!: string;
    curBidDisc!: string;
    kapan!: string;
    rfid!: string;
    shape!: string;
    weight!: number;
    color!: string;
    clarity!: string;
    cut!: string;
    polish!: string;
    symmetry!: string;
    fluorescence!: string;
    measurement!: InventoryItemMeasurement;
    inclusion!: InventoryItemInclusion;
    location!: string;
    certificateNo!: string;
    media: Media;
    price: PriceDNorm;
    imageURL!: string;
    videoURL!: string;
    certiURL!: string;
    typeA!: string;
    approvedDate!: Date;
    approvedBy!: string;
    isApproved!: boolean;
    bidNetAmount!: number;
    bidPerCarat!: number;
    bidDiscount!: number;

    constructor() {
        this.price = new PriceDNorm();
        this.measurement = new InventoryItemMeasurement();
        this.inclusion = new InventoryItemInclusion();
        this.media = new Media();
    }
}
