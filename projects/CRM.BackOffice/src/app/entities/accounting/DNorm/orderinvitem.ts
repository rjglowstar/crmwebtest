import { PriceDNorm } from "../../inventory/priceDNorm";

export class OrderInvItem {
    invId!: string;
    stoneId!: string;
    kapan!: string;
    shape!: string;
    weight!: number;
    color!: string;
    clarity!: string;
    cut!: string;
    polish!: string;
    symmetry!: string;
    fluorescence!: string;
    lab!: string;
    kapanOrigin!: string;
    certificateNo!: string;
    certiType!: string
    diaMeter!: string;
    price: PriceDNorm;
    sDiscount!: number | null;
    fDiscount!: number | null;
    perCarat!: number
    netAmount?: number | null;
    fAmount!: number | null;
    ccRate!: number;
    ccType!: string;
    brokerAmount!: number;
    vowDiscount!: number;
    vowAmount!: number;
    isColor!: boolean
    isTransit!: boolean
    isMemo!: boolean
    heldBy!: string
    terms!: string;
    remark!: string;

    constructor() {
        this.price = new PriceDNorm();
        this.isColor = false;
        this.isMemo = false;
        this.isTransit = false;
    }
}