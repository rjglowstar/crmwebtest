export class InWardMemoSearchCriteria {
    fromDate!: Date | null
    toDate!: Date | null
    memoNo!: string
    partyId!: string
    brokerId!: string
    stoneIds!: string[]
    certificateNos!: string[]
    isReturn!: boolean | null

    constructor() {
        this.fromDate = null;
        this.toDate = null;
        this.memoNo = '';
        this.partyId = '';
        this.brokerId = '';
        this.stoneIds = [];
        this.certificateNos = [];
        this.isReturn = false;
    }
}