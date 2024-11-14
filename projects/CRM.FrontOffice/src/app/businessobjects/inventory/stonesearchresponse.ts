export class StoneSearchResponse {
    stoneId!: string;
    certificateNo!: string;
    shape!: string;
    location!: string;
    netAmount!:number;
    status!: string;
    isHold!: boolean;
    isMemo!: boolean;
    isPricing!: boolean;
    isLabReturn!: boolean;
    inLead!: boolean;
    leadNo!: number;
    leadStatus!: string;
    leadDate!: Date | null;
    orderDate!: Date | null;
    party!: string;
    company!: string;

    constructor() { }
}