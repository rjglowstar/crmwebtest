export class InclusionExcelItems {
    // InvItems
    stoneId!: string
    shape!: string
    //InvItem Measurement
    depth?: number
    table?: number
    length?: number
    width?: number
    height?: number
    crownHeight?: number
    crownAngle?: number
    pavilionDepth?: number
    pavilionAngle?: number
    girdlePer?: number
    minGirdle!: string
    maxGirdle!: string
    ratio?: number
    //InvItem Inclusion
    brown!: string;
    green!: string;
    milky!: string;
    shade!: string;
    centerBlack!: string;
    sideBlack!: string;
    openCrown!: string;
    openTable!: string;
    openPavilion!: string;
    openGirdle!: string;
    girdleCondition!: string;
    efoc!: string;
    efop!: string;
    culet!: string;
    hna!: string;
    eyeClean!: string;
    naturalOnGirdle!: string;
    naturalOnCrown!: string;
    naturalOnPavillion!: string;
    bowtie!: string;
    comment!: string
    bgmComments!: string
    updatedBy?: string
    // temp
    isDisabled?: boolean
    isDataMissing?: boolean

    constructor() { }
}