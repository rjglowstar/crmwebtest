import { Address } from "shared/businessobjects"

export class OrganizationDNorm {
    id!: string
    name!: string
    person!: string
    email!: string
    address: Address
    incomeTaxNo!: string
    taxNo!: string
    iecNo!: string
    mobileNo!: string
    phoneNo!: string
    faxNo?: string
    gstNo!: string
    
    constructor() {
        this.address = new Address();
    }
}