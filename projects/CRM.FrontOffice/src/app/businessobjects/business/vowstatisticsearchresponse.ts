import { VowStatistic } from "./vowstatistic";

export class VowStatisticSearchResponse {
    vowStatistic: VowStatistic[];
    totalCount!: number;

    constructor() {
        this.vowStatistic = [];

    }
}