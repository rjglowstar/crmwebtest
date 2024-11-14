import { WeightRange } from "../inventory/weightrange"

export class OrderDetailFilter {
    leadNo!: number[]
    companyName!: string[]
    brokerName!: string[]
    sellerName!: string[]
    startDate?: Date | null;
    endDate?: Date | null;
    stoneIds!: string[]//
    kapan!: string[]//
    shape!: string[]
    weightRanges!: WeightRange[]
    color!: string[]
    clarity!: string[]
    status!: string[]
    flour!: string[]
    cut!: string[]
    polish!: string[]
    symm!: string[]
    location!: string[]
    lab!: string[]
    certificateNos!: string[]//
    fromDiscount?: number
    toDiscount?: number
    fromPerCarat?: number
    toPerCarat?: number
    fromNetAmt?: number
    toNetAmt?: number

    iGrade!: string[]
    mGrade!: string[]
    shade!: string[]
    kToS!: string[]
    culet!: string[]
    fromDepth?: number
    toDepth?: number
    fromTable?: number
    toTable?: number
    fromGirdlePer?: number
    toGirdlePer?: number
    fromCrownHeight?: number
    toCrownHeight?: number
    fromCrownAngle?: number
    toCrownAngle?: number
    fromPavilionAngle?: number
    toPavilionAngle?: number
    fromPavilionDepth?: number
    toPavilionDepth?: number
    fromLength?: number
    toLength?: number
    fromWidth?: number
    toWidth?: number
    fromHeight?: number
    toHeight?: number
    fromRatio?: number
    toRatio?: number
    brown!: string[]
    green!: string[]
    milky!: string[]
    sideBlack!: string[]
    centerBlack!: string[]
    sideWhite!: string[]
    centerWhite!: string[]
    openCrown!: string[]
    openTable!: string[]
    openPavilion!: string[]
    openGirdle!: string[]
    naturalOnGirdle!: string[]
    naturalOnCrown!: string[]
    naturalOnPavillion!: string[]
    naturalOnTable!: string[]
    hNA!: string[]
    eyeClean!: string[]
    eFOC!: string[]
    eFOP!: string[]
    eFOT!: string[]
    eFOG!: string[]
    girdleCondition!: string[]
    luster!: string[]
    bowtie!: string[]
    sellerId!: string;

    constructor() {
        this.leadNo = new Array<number>();
        this.companyName = new Array<string>();
        this.brokerName = new Array<string>();
        this.sellerName = new Array<string>();
        this.stoneIds = new Array<string>();
        this.status = new Array<string>();
        this.kapan = new Array<string>();
        this.shape = new Array<string>();
        this.weightRanges = new Array<WeightRange>();
        this.color = new Array<string>();
        this.clarity = new Array<string>();
        this.flour = new Array<string>();
        this.cut = new Array<string>();
        this.polish = new Array<string>();
        this.symm = new Array<string>();
        this.location = new Array<string>();
        this.lab = new Array<string>();
        this.certificateNos = new Array<string>();
        this.iGrade = new Array<string>();
        this.mGrade = new Array<string>();
        this.shade = new Array<string>();
        this.kToS = new Array<string>();
        this.culet = new Array<string>();
        this.brown = new Array<string>();
        this.green = new Array<string>();
        this.milky = new Array<string>();
        this.sideBlack = new Array<string>();
        this.centerBlack = new Array<string>();
        this.sideWhite = new Array<string>();
        this.centerWhite = new Array<string>();
        this.openCrown = new Array<string>();
        this.openTable = new Array<string>();
        this.openPavilion = new Array<string>();
        this.openGirdle = new Array<string>();
        this.naturalOnGirdle = new Array<string>();
        this.naturalOnCrown = new Array<string>();
        this.naturalOnPavillion = new Array<string>();
        this.naturalOnTable = new Array<string>();
        this.hNA = new Array<string>();
        this.eyeClean = new Array<string>();
        this.eFOC = new Array<string>();
        this.eFOP = new Array<string>();
        this.eFOT = new Array<string>();
        this.eFOG = new Array<string>();
        this.girdleCondition = new Array<string>();
        this.luster = new Array<string>();
        this.bowtie = new Array<string>();
    }
}