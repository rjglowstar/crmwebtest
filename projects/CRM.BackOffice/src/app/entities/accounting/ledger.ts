import { Address, CreditLimit } from "shared/businessobjects"
import { BaseEntity } from "shared/enitites/common/baseentity"
import { LedgerGroup } from "./ledgergroup"
import { BankDNorm } from "./bankdnorm"
import { BrokerDNorm } from "./dnorm/brokerdnorm"

export class Ledger extends BaseEntity {
  name!: string
  group: LedgerGroup = new LedgerGroup()
  code!: string
  contactPerson!: string
  partyType!: string
  address: Address;
  otherAddress: Address[]
  email!: string
  mobileNo!: string
  phoneNo!: string
  faxNo!: string
  incomeTaxNo!: string
  taxNo!: string
  lineOfBusiness!: string
  bank!: BankDNorm
  broker: BrokerDNorm
  isActive!: boolean
  idents!: string[]
  limit!: CreditLimit
  credit!: number
  debit!: number
  tdsRate!: number
  tdsLimit!: number
  declaration!: string
  logisticAcc!: string
  ccType!: string
  expiredDate!: Date | null
  isVerified!: boolean
  isCertReminder!: boolean

  constructor() {
    super();
    this.address = new Address();
    this.otherAddress = [];
    this.group = new LedgerGroup();
    this.broker = new BrokerDNorm();
    this.bank = new BankDNorm();
    this.limit = new CreditLimit();
    this.isActive = true;
    this.isVerified = false;
    this.isCertReminder = false;
    this.idents = [];
  }
}