import { Address } from "../../common/address"

export class SupplierDNorm {
    id!: string
    name!: string
    person!: string
    phoneNo!: string
    faxNo?: string
    email!: string
    address?: Address
    
    constructor() { 
        this.address = new Address();
    }
}