import { SortFieldDescriptor } from "../common/sortfielddescriptor";

export class OrderSearchCriteria {
    stoneIds!: string[];
    partyId: string;
    brokerId: string;
    sellerId: string;
    isTransaction: boolean;
    isDelivered: boolean;
    leadNos!: string[];
    certificateNos!: string[];
    partyCodes!: string[];
    fromDate!: Date | null;
    toDate!: Date | null;
    tFromDate!: Date | null;
    tToDate!: Date | null;
    country: string;
    sortFieldDescriptors: Array<SortFieldDescriptor> = new Array<SortFieldDescriptor>();
    isColorFlag!: boolean;
    isNotStock!: boolean;
    isTransit!: boolean
    isMemo!: boolean

    constructor() {
        this.partyId = '';
        this.brokerId = '';
        this.sellerId = '';
        this.isTransaction = null as any;
        this.isDelivered = false;
        this.country = '';
        this.isColorFlag = null as any;
        this.isNotStock = null as any;
        this.isTransit = null as any;
        this.isMemo = null as any;
    }
}