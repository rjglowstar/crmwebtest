export class LedgerSearchCriteria {
    name!: string
    group!: string
    code!: string
    contactPerson!: string
    email!: string
    mobileNo!: string
    phoneNo!: string
    isVerified!: boolean | null

    constructor() {
        this.name = "";
        this.group = "";
        this.code = "";
        this.contactPerson = "";
        this.email = "";
        this.mobileNo = "";
        this.phoneNo = "";
        this.isVerified = null;
    }

}