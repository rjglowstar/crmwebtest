import { SortFieldDescriptor } from "projects/CRM.BackOffice/src/app/businessobjects";
import { WeightRange } from "..";

export class InventorySearchCriteria {
    supplierIds: string[];
    empId: string[];
    customerId?: string;
    stoneIds: string[];
    certificateNos: string[];
    kapan: string[];
    weightRanges: WeightRange[];

    location: string[];
    status: string[];
    leadStatus: string[];
    shape: string[];
    color: string[];
    clarity: string[];
    flour: string[];
    shade: string[];
    lab: string[];
    cps: string[];
    cut: string[];
    polish: string[];
    symm: string[];
    kToS: string[];
    culet: string[];
    brown: string[];
    green: string[];
    milky: string[];

    sideBlack: string[];
    centerBlack: string[];
    sideWhite: string[];
    centerWhite: string[];

    openCrown: string[];
    openTable: string[];
    openPavilion: string[];
    openGirdle: string[];

    naturalOnGirdle: string[];
    naturalOnCrown: string[];
    naturalOnPavillion: string[];
    naturalOnTable: string[];
    hNA: string[];
    eyeClean: string[];
    eFOC: string[];
    eFOP: string[];
    eFOT: string[];
    eFOG: string[];
    girdleCondition: string[];

    luster: string[];
    bowtie: string[];

    fromDiscount?: number | null;
    toDiscount?: number | null;
    fromRatio?: number | null;
    toRatio?: number | null;
    fromDepth?: number | null;
    toDepth?: number | null;
    fromTable?: number | null;
    toTable?: number | null;
    fromLength?: number | null;
    toLength?: number | null;
    fromWidth?: number | null;
    toWidth?: number | null;
    fromHeight?: number | null;
    toHeight?: number | null;
    fromCrownHeight?: number | null;
    toCrownHeight?: number | null;
    fromCrownAngle?: number | null;
    toCrownAngle?: number | null;
    fromPavilionAngle?: number | null;
    toPavilionAngle?: number | null;
    fromPavilionDepth?: number | null;
    toPavilionDepth?: number | null;
    girdle: string[];
    fromGirdlePer?: number | null;
    toGirdlePer?: number | null;
    fromPerCarat?: number | null;
    toPerCarat?: number | null;
    fromNetAmt?: number | null;
    toNetAmt?: number | null;

    fromMarketsheetDay?: number | null;
    toMarketsheetDay?: number | null;

    fromAvailableDay?: number | null;
    toAvailableDay?: number | null;

    fromStrLn?: number | null;
    toStrLn?: number | null;
    fromLrHalf?: number | null;
    toLrHalf?: number | null;
    minWeight!: number
    maxWeight!: number

    isAvailable?: boolean;
    isHold?: boolean;
    isRfid?: boolean;
    isRapnetHold?: boolean;

    isMemo?: boolean;
    isLead?: boolean;
    isFancy?: boolean;
    isTypeTwo?: boolean;
    typeA: string[];
    isLabReturn?: boolean;
    isPhotography?: boolean;

    fromDate?: Date | null;
    toDate?: Date | null;

    fromHoldDate?: Date | null;
    toHoldDate?: Date | null;
    holdBy: string[];

    iGrade: string[];
    mGrade: string[];

    //For Pricing Request
    discColorMark: string[];
    showTemp?: boolean;
    showSpecialStone?: boolean;

    selectedStones: string[];

    sortFieldDescriptors: Array<SortFieldDescriptor> = new Array<SortFieldDescriptor>();
    isDOrder?:boolean;
    isBgm: boolean;
    isInExpo?: boolean;

    fromPriceDate?: Date | null;
    toPriceDate?: Date | null;
    showLockStone?: boolean;
    partyIds: string[];

    constructor() {
        this.supplierIds = [];
        this.empId = [];
        this.customerId = "";
        this.stoneIds = [];
        this.certificateNos = [];
        this.weightRanges = [];
        this.kapan = [];
        this.location = [];
        this.status = [];
        this.leadStatus = [];
        this.shape = [];
        this.color = [];
        this.clarity = [];
        this.flour = [];
        this.shade = [];
        this.lab = [];
        this.cps = [];
        this.cut = [];
        this.polish = [];
        this.symm = [];

        this.kToS = [];
        this.culet = [];
        this.brown = [];
        this.milky = [];
        this.green = [];
        this.sideBlack = [];
        this.centerBlack = [];
        this.sideWhite = [];
        this.centerWhite = [];
        this.openCrown = [];
        this.openTable = [];
        this.openPavilion = [];
        this.openGirdle = [];
        this.naturalOnGirdle = [];
        this.naturalOnTable = [];
        this.naturalOnCrown = [];
        this.naturalOnPavillion = [];
        this.hNA = [];
        this.eyeClean = [];
        this.eFOC = [];
        this.eFOP = [];
        this.eFOT = [];
        this.eFOG = [];
        this.girdleCondition = [];
        this.luster = [];
        this.bowtie = [];

        this.iGrade = [];
        this.mGrade = [];

        this.discColorMark = [];

        this.selectedStones = [];
        this.isBgm = false;
        this.holdBy = [];
        this.girdle = [];
        this.typeA = [];
        this.partyIds = [];
    }
}