export class CustomerLoginHistoryCriteria {
    companyName: string
    country: string
    state: string
    toDate?: Date
    fromDate?: Date
    sellerId: string
    isAdmin: boolean

    constructor() {
        this.companyName = "";
        this.state = "";
        this.country = "";
        this.sellerId = "";
        this.isAdmin = false;
    }
}