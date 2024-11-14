export class CustomerVerificationSearchCriteria {
    companyName: string
    email: string
    mobileNo: string
    country: string
    sellerId?: string
    status: Array<string>
    verifyStatus!: boolean | null

    constructor() {
        this.companyName = "";
        this.email = "";
        this.mobileNo = "";
        this.country = "";
        this.verifyStatus = null;
        this.status = new Array<string>();
    }
}