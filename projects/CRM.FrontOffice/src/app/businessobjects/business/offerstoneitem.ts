import { CustomerDNorm, InventoryItemInclusion, InventoryItemMeasurement, PriceDNorm, SupplierDNorm, SystemUserDNorm } from "../../entities";
import { Media } from "../../entities/inventory/media";
import { BrokerDNorm } from "../organizations/brokerdnorm";

export class OfferStoneItem {

    leadNo!: number | null;
    customer: CustomerDNorm;
    broker: BrokerDNorm;
    seller: SystemUserDNorm
    stoneId!: string;
    shape!: string;
    weight!: number;
    offer!: number | null;
    comment!: string;
    color!: string;
    offerDate!: string;
    clarity!: string;
    cut!: string;
    polish!: string;
    symmetry!: string;
    fluorescence!: string;
    location!: string;
    lab!: string
    status!: string
    inscription!: string
    comments!: string
    boxSerialNo!: string
    offerPerCT!: string
    offerNetAmount!: string
    certificateNo!: string;
    price: PriceDNorm;
    media: Media
    inclusion: InventoryItemInclusion;
    measurement: InventoryItemMeasurement
    labSendDate!: Date | null
    labReceiveDate!: Date | null
    marketSheetDate!: Date | null
    createdDate!: Date | null
    discDiff!: number | null;
    aDiscount!: number | null;
    fDiscount!: number | null;
    netAmount!: number | null;
    perCarat!: number | null;
    vowDiscount!: number | null;
    vowAmount!: number | null;
    fAmount!: number | null;
    days!: number | null;
    aDays!: number | null;
    isSold!: boolean;
    supplier: SupplierDNorm;

    constructor() {
        this.customer = new CustomerDNorm();
        this.broker = new BrokerDNorm();
        this.price = new PriceDNorm();
        this.supplier = new SupplierDNorm();
        this.seller = new SystemUserDNorm();
        this.media = new Media();
        this.inclusion = new InventoryItemInclusion();
        this.measurement = new InventoryItemMeasurement();

    }
}


