import { Address } from "shared/businessobjects"

export class SupplierDNorm {
    id!: string
    name!: string
    person!: string
    phoneNo!: string
    faxNo?: string
    email!: string
    code!: string
    address?: Address
    
    constructor() { 
        this.address = new Address();
    }
}