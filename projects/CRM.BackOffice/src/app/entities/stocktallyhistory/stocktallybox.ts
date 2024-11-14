import { BaseEntity } from "shared/enitites";
import { RFIDClass } from "./base/rfidclass";

export class StockTallyBox extends BaseEntity {

    stockTallyBoxList: Array<RFIDClass> = new Array<RFIDClass>();
    stockTallyBoxNo!: number;

    constructor() {
        super();
    }
}