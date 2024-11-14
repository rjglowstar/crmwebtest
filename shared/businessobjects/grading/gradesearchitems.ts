import { GirdleDNorm } from "./girdlednorm";
import { InclusionPrice } from "./inclusionprice";
import { MeasItems } from "./measitems";

export class GradeSearchItems {
    id!: string;
    lab!: string;
    shape!: string;
    size!: number;
    color!: string;
    clarity!: string;
    cut!: string;
    polish!: string;
    sym!: string;
    fluo!: string;
    inclusion: InclusionPrice;
    measurement: MeasItems[];
    girdle: GirdleDNorm;
    certComment: string[];
    ktoS: string[];
    girdlePer!: number

    constructor() {
        this.inclusion = new InclusionPrice();
        this.measurement = [];
        this.girdle = new GirdleDNorm();
        this.certComment = [];
        this.ktoS = [];
    }
}