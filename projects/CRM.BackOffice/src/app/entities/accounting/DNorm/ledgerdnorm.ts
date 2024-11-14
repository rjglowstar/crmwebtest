import { Address } from "shared/businessobjects"

export class LedgerDNorm {
    id!: string
    group!: string
    name!: string
    code!: string
    contactPerson!: string
    email!: string
    mobileNo!: string
    phoneNo!: string
    faxNo!: string
    address: Address
    idents!: string[]
    incomeTaxNo!: string
    taxNo!: string
    ccType?: string;
    isVerified?:boolean
    isCertReminder?:boolean

    constructor() {
        this.address = new Address();
        this.idents = [];
    }

}