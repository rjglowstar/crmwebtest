import { BaseEntity } from "shared/enitites/common/baseentity"
import { PriceDNorm } from "../inventory/priceDNorm";

export class ExportRequest extends BaseEntity {
    stoneId!: string;
    certificateNo!: string;
    shape!: string;
    weight!: number;
    color!: string;
    clarity!: string;
    cut!: string;
    polish!: string;
    symmetry!: string;
    fluorescence!: string;
    location!: string;
    requestedBy!: string;
    price: PriceDNorm;

    constructor() {
        super();
        this.price = new PriceDNorm()
    }
}