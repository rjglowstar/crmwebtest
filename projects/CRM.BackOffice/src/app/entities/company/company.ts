import { Address } from "shared/businessobjects"
import { BaseEntity } from "shared/enitites"

export class Company extends BaseEntity {
      name!: string
      email!: string
      mobileNo!: string
      phoneNo!: string
      faxNo!: string
      website!: string
      registrationNo!: string
      incomeTaxNo!: string
      taxNo!: string
      address: Address      

      constructor() {
            super();
            this.address = new Address();           
      }
}