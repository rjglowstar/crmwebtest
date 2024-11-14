export class MemoReturnSearchCriteria {
    fromDate!: Date | null
    toDate!: Date | null
    memoReturnNo!: string
    partyId!: string   
    stoneIds!: string[]
    certificateNos!: string[]

    constructor() {
        this.fromDate = null;
        this.toDate = null;
        this.memoReturnNo = '';
        this.partyId = '';       
        this.stoneIds = [];
        this.stoneIds = [];
    }
}