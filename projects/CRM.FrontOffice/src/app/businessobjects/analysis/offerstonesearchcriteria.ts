import { WeightRange } from "../inventory/weightrange";

export class OfferStoneSearchCriteria {

    stoneIds: string[];
    certificateNos: string[];
    locations: string[];
    statuses: string[];
    shapes: string[];
    colors: string[];
    clarities: string[];
    flours: string[];
    shades: string[];
    cuts: string[];
    polishes: string[];
    symmentries: string[];
    browns: string[];
    greens: string[];
    milkies: string[];
    FromWeight: number;
    ToWeight: number;
    fromOfferDate: Date | null = null;
    toOfferDate: Date | null = null;
    isSold?: boolean;
    parties: string[];
    sellers: string[];

    constructor() {
        this.stoneIds = new Array<string>();
        this.certificateNos = new Array<string>();
        this.locations = new Array<string>();
        this.statuses = new Array<string>();
        this.shapes = new Array<string>();
        this.colors = new Array<string>();
        this.clarities = new Array<string>();
        this.flours = new Array<string>();
        this.shades = new Array<string>();
        this.cuts = new Array<string>();
        this.polishes = new Array<string>();
        this.symmentries = new Array<string>();
        this.browns = new Array<string>();
        this.milkies = new Array<string>();
        this.greens = new Array<string>();
        this.parties = new Array<string>();
        this.sellers = new Array<string>();
        this.FromWeight = null as any
        this.ToWeight = null as any
    }
}