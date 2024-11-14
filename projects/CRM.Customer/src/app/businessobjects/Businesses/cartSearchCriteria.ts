export class CartSearchCriteria {
    stoneId!: string
    certificateNo!: string
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
    status!:string
    fromDate?: Date | null
    toDate?: Date | null
    sellerId!: string
    customerId!: string
    stoneIds: string[]
    certificateNos: string[]
    leadStatus: string[]
    isFilter: boolean
    isLeadNo: boolean

    constructor() {
        this.shapes = new Array<string>();
        this.colors = new Array<string>();
        this.clarities = new Array<string>();
        this.cuts = new Array<string>();
        this.polishes = new Array<string>();
        this.symmetries = new Array<string>();
        this.fluorescences = new Array<string>();
        this.labs = new Array<string>();
        this.stoneIds = new Array<string>();
        this.certificateNos = new Array<string>();
        this.leadStatus = new Array<string>();
        this.isFilter = false;
        this.isLeadNo = false;
    }
}