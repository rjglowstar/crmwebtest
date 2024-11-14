import { PriceDNorm } from "../../inventory/priceDNorm";
import { SupplierDNorm } from "../../supplier/dnorm/supplierdnorm";

export class LeadRejectedOfferItem {
    stoneId!: string;
    shape!: string;
    weight!: number;
    offer!: number;
    comment!: string;
    offerDate!: Date

    color!: string;
    clarity!: string;
    cut!: string;
    polish!: string;
    symmetry!: string;
    fluorescence!: string;
    location!: string;
    certificateNo!: string;

    price: PriceDNorm
    discDiff!: number;

    aDiscount!: number
    fDiscount!: number
    perCarat!: number
    netAmount?: number | null;
    vowDiscount!: number;
    vowAmount!: number;
    fAmount!: number
    supplier: SupplierDNorm

    //Extra
    isRequired!: boolean | null
    constructor() {
        this.price = new PriceDNorm();
        this.supplier = new SupplierDNorm();
    }
}