import { BaseEntity } from "shared/enitites"
import { StockTally } from "./base/stocktally";

export class StockTallyHistory extends BaseEntity {

    stockTallyList: Array<StockTally> = new Array<StockTally>();
    stockTallyNo!: number;

    constructor() {
        super();
    }
}