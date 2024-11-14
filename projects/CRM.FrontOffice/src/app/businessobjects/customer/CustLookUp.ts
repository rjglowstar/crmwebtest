import { Address } from "shared/businessobjects"

export class CustLookUp {
    id!: string
    fullName!: string
    code!: string
    companyName!: string
    email!: string
    mobile1!: string
    address: Address;
    constructor() { 
        this.address = new Address();
    }
}