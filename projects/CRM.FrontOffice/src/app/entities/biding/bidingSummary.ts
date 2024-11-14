import { BaseEntity } from "shared/enitites"
import { BidTimer } from "./bidTimer";
import { InvItem } from "../business/base/invitem";
import { InvDetailItem } from "../inventory/invDetailItem";

export class BidingSummary extends BaseEntity {
    id!: string
    bidNumber!: string
    isActiveBid!: boolean
    isGreater!: boolean
    invDetailItems!: InvDetailItem[]
    bidTimer!: BidTimer

    constructor() {
        super();
        this.isGreater = false;
        this.invDetailItems = new Array<InvDetailItem>();
        this.bidTimer = new BidTimer();
    }
}