import { InventoryItems} from "../../entities";

export class MemoReceiveItems {
    memoId!: string
    memoNo!: string;
    inventoryItems: InventoryItems[] 

    constructor() {
        this.inventoryItems = new Array<InventoryItems>();
    }
}