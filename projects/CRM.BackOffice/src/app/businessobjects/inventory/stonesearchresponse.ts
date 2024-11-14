export class StoneSearchResponse {
    stoneId!: string;
    certificateNo!: string;
    shape!: string;
    status!: string;
    isHold!: boolean;
    heldBy!: string;
    isPricing!: boolean;
    isLabReturn!: boolean;

    isMemo!: boolean;
    memoNo!: string;
    memoDate!: Date | null;

    isInward!: boolean;
    inwardNo!: string;
    inwardDate!: Date | null;

    isOrder!: boolean;
    orderLeadNo!: string;
    orderPartyPerson!: string;
    orderPartyCompany!: string;
    orderDate!: Date | null;
    orderDeliveryDate!: Date | null;

    constructor() { }
}