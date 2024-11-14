import { BaseEntity } from "shared/enitites";
import { Media } from '../inventory/media';
import { PriceDNorm } from "../inventory/priceDNorm";
import { InventoryItemInclusion } from "../inventory/inventoryiteminclusion";
import { InventoryItemMeasurement } from "../inventory/inventoryitemmeasurement";
import { SupplierDNorm } from "../supplier/dnorm/supplierdnorm";
import { IdentityDNorm } from "../inventory/identityDNorm";

export class TempPricing extends BaseEntity {
    stoneId!: string;
    kapan!: string;
    article!: string;
    grade!: string;
    shape!: string;
    weight!: number;
    color!: string;
    clarity!: string;
    cps!: string;
    cut!: string;
    polish!: string;
    symmetry!: string;
    fluorescence!: string;
    lab!: string;
    location!: string;
    comments!: string;
    basePrice: PriceDNorm;
    price: PriceDNorm;
    tempBasePrice: PriceDNorm;
    tempPrice: PriceDNorm;
    inclusion: InventoryItemInclusion;
    measurement: InventoryItemMeasurement;
    supplier: SupplierDNorm;
    identity: IdentityDNorm;
    discountOne!: number;
    discountTwo!: number;
    discountThree!: number;
    isValid!: boolean;
    marketSheetDate!: Date | null
    media: Media;
    isHold!: boolean;
    isRapnetHold!: boolean;
    isTypeTwo: boolean
    typeA!: string;
    discColorMark!: string;
    availableDays!: number;
    holdDate!: Date | null;
    holdDays!: number;
    holdBy!: string;
    //Extra
    certificateNo!: string;
    isMemo!: boolean;
    isHighLight!: boolean;
    isDOrder!: boolean;
    days!: number | null;
    pricingComment!: string;
    isLock!: boolean;
    isSpecialStone!: boolean;

    constructor() {
        super();
        this.inclusion = new InventoryItemInclusion();
        this.measurement = new InventoryItemMeasurement();
        this.basePrice = new PriceDNorm();
        this.price = new PriceDNorm();
        this.tempBasePrice = new PriceDNorm();
        this.tempPrice = new PriceDNorm();
        this.supplier = new SupplierDNorm();
        this.identity = new IdentityDNorm();
        this.media = new Media();
        this.isTypeTwo = false;
    }
}