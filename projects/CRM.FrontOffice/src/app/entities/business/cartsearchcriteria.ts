import { CustomerDNorm, SystemUser } from "..";


// extends InventorySearchCriteria
export class CartSearchCriteria {
    stoneId!: string;
    certificateNo!: string;
    minSize!: number
    maxSize!: number
    shapes!: string[]
    colors!: string[]
    clarities!: string[]
    cuts!: string[]
    polishes!: string[]
    symmetries!: string[]
    fluorescences!: string[]
    labs!: string[]
    fromDate!: Date
    toDate!: Date
    sellerId!: string
    customerId!: string
    stoneIds: Array<string>;
    isFilter: boolean;
    isLeadNo: boolean;
    isDoNotRejected: boolean;
    certificateNos!: Array<string>;


    constructor() {
        this.isFilter = false;
        this.stoneIds = new Array<string>();
        this.isLeadNo = false;
        this.isDoNotRejected = true;
    }
}