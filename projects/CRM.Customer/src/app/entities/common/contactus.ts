import { Address } from "shared/businessobjects";

export class ContactUs {

    companyName!: string;
    name!: string;
    email!: string;
    contactNo!: string;
    message!: string;
    address: Address;
    from!: string;

    constructor() {
        this.address = new Address();
    }
}