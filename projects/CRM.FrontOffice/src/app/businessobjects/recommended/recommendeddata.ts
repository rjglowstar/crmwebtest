import { BaseEntity } from "shared/enitites";

export class RecommendedData extends BaseEntity {
    stoneIds!: string[];
    customerIds!: string[];
    endDate!: Date

    constructor() {
        super();
        this.stoneIds=[];
        this.customerIds=[];
    }
}