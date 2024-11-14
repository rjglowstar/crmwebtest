import { BaseEntity } from "shared/enitites";

export class PriceExpiryCriteria extends BaseEntity {
    name!: string;
    shape: string[];
    minWeight!: number;
    maxWeight!: number;
    color: string[];
    clarity: string[];
    cps: string[];
    isBgm!: boolean;
    days!: number;

    constructor() {
        super();
        this.shape = [];
        this.color = [];
        this.clarity = [];
        this.cps = [];
    }
}