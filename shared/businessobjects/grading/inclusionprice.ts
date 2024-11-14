export class InclusionPrice {
    brown!: string;
    green!: string;
    milky!: string;
    shade!: string;
    sideBlack!: string;
    centerBlack!: string;
    sideWhite!: string;
    centerWhite!: string;
    openTable!: string;
    openCrown!: string;
    openPavilion!: string;
    openGirdle!: string;
    girdleCond: string[];
    eFOC!: string;
    eFOP!: string;
    culet!: string;
    hNA!: string;
    eyeClean!: string;
    kToS: string[] | null;
    naturalOnGirdle!: string;
    naturalOnCrown!: string;
    naturalOnPavillion!: string;
    flColor!: string;
    luster!: string;
    bowTie!: string;
    certiComment!: string;

    constructor(){
        this.girdleCond = [];
        this.kToS = null;
    }
}