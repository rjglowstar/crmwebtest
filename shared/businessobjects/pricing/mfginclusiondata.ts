export class MfgInclusionData {
    Brown !: string;
    Green !: string;
    Milky!: string;
    Shade!: string;
    SideBlack!: string;
    CenterBlack!: string;
    SideWhite!: string;
    CenterWhite!: string;
    OpenTable!: string;
    OpenCrown!: string;
    OpenPavilion!: string;
    OpenGirdle!: string;
    GirdleCond: string[];
    EFOC!: string;
    EFOP!: string;
    Culet!: string;
    HNA!: string;
    EyeClean!: string;
    KToS: string[];
    NaturalOnGirdle!: string;
    NaturalOnCrown!: string;
    NaturalOnPavillion!: string;
    FlColor!: string;
    Luster!: string;
    BowTie!: string;
    CertiComment!: string;

    constructor() {
        this.GirdleCond = []
        this.KToS = []
        this.Brown = '';
        this.Green = '';
        this.Milky = '';
        this.Shade = '';
        this.SideBlack = '';
        this.CenterBlack = '';
        this.SideWhite = '';
        this.CenterWhite = '';
        this.OpenTable = '';
        this.OpenCrown = '';
        this.OpenPavilion = '';
        this.OpenGirdle = '';
        this.EFOC = '';
        this.EFOP = '';
        this.Culet = '';
        this.HNA = '';
        this.EyeClean = '';
        this.NaturalOnGirdle = '';
        this.NaturalOnCrown = '';
        this.NaturalOnPavillion = '';
        this.FlColor = '';
        this.Luster = '';
        this.BowTie = '';
        this.CertiComment = '';
    }
}