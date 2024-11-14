import { PriceDNorm } from "../../inventory/priceDNorm"

export class PackingItem {
    invId!: string
    stoneId!: string
    shape!: string
    weight!: number
    color!: string
    clarity!: string
    certificateNo!: string
    certiType!: string
    price: PriceDNorm
    lab!: string
    origin!: string
    isInward!: boolean
    ccRate!: number;
    ccType!: string;

    //extra
    isDisabled: boolean

    constructor() {
        this.price = new PriceDNorm();
        this.isDisabled = false;
    }
}