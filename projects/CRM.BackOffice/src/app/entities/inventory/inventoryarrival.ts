import { BaseEntity } from "shared/enitites";

export class InventoryArrival extends BaseEntity {
    loatNo!: string;
    shape!: string;
    remark!: string
    weight!: number;
    color!: string;
    clarity!: string;
    cut!: string;
    polish!: string;
    symmetry!: string;
    fluro!: string;
    origin!: string;
    tableAngle!: number | null;
    length!: number | null;
    width!: number | null;
    height!: number | null;
    tableDepth!: number | null;
    crownAngle!: number | null;
    girdlePer!: number | null;

    constructor() {
        super();
    }
}