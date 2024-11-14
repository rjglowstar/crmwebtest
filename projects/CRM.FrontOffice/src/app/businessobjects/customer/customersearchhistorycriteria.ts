export class CustomerSearchHistoryCriteria {
    customerId!: string;
    sellerId!: string;
    stoneIds: string[];
    shape!: string;
    color!: string;
    cut!: string;
    clarity!: string;
    polish!: string;
    symm!: string;
    flour!: string;
    lab!: string;
    showBlankEntry!: boolean | null;
    fromDate!: Date | null;
    toDate!: Date | null;

    constructor() {
        this.stoneIds = [];
    }
}