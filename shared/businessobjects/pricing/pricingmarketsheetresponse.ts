export class PricingMarketSheetResponse {
    id!: string;
    lab!: string;
    rapPrice!: number;
    dCaret!: number;
    amount!: number;
    deadStockDiscount!: number;
    discount!: number;
    masterDiscount!: number;
    mfgDiscount!: number | null;
    salesAddDiscount!: number | null;
    iGrade!: string;
    iDiscount!: number | null;
    mGrade!: string;
    mDiscount!: number | null;
    error!: string;

    constructor() { }
}