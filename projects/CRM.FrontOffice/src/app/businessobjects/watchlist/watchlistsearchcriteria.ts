export class WatchListSearchCriteria{
    stoneIds: string[]
    certificateNos: string[]
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
    sellerId?:string

    constructor(){
        this.stoneIds = new Array<string>();
        this.certificateNos = new Array<string>();
        this.shapes = new Array<string>();
        this.colors = new Array<string>();
        this.clarities = new Array<string>();
        this.cuts = new Array<string>();
        this.polishes = new Array<string>();
        this.symmetries = new Array<string>();
        this.fluorescences = new Array<string>();
        this.labs = new Array<string>();
    }
}