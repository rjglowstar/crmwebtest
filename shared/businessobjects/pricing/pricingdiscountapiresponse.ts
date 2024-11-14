export class PricingDiscountApiResponse {
    id!: string;
    lab!: string;
    rapPrice!: number;
    dCaret!: number;
    amount!: number;
    deadStockDiscount!: number | null;
    discount!: number;
    masterDiscount!: number | null;
    mfgDiscount!: number | null;
    salesAddDiscount!: number | null;
    iGrade?: any;
    iDiscount?: any;
    mGrade?: any;
    mDiscount?: any;
    error?: any;

    constructor(){}
}