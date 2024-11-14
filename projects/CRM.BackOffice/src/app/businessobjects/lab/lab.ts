import { Address } from "shared/businessobjects"
import { BaseEntity } from "shared/enitites"
import { LabConfig } from "./labconfig"

export class Lab extends BaseEntity {
  name!: string
  code!: string
  email!: string
  website!: string
  mobileNo!: string
  phoneNo!: string
  registrationNo!: string
  incomeTaxNo!: string
  taxNo!: string
  currencyType!:string
  excFormat!: string
  faxNo!: string
  address: Address
  labConfig!: LabConfig
  accountNo!: string

  constructor() {
    super();
    this.address = new Address();
    this.labConfig = new LabConfig();
  }
}