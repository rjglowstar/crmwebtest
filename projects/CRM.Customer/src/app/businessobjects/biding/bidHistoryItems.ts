import { BidHistoryInvItem } from "./bidHistoryInvItem";

export class BidHistoryItems {
    bidNumber!: string;
    totalStones!: number;
    auctionDate!: Date;
    totalAmt!: number;
    totalPerCT!: number;
    totalWeight!: number;
    bidInvItems!: BidHistoryInvItem[];

    constructor() {
        this.bidInvItems = [];
    }
}