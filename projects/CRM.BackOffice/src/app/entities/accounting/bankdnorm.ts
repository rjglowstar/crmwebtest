import { Address } from "shared/businessobjects";

export class BankDNorm {
    bankName!: string;
    branch!: string;
    address: Address
    accountNo!: string;
    accountName!: string;
    ifsc!: string;
    iBan!: string;
    swift!: string;
    adCode!: string;
    intermediaryBankName!: string;
    intermediaryBankAddress!: string;
    intermediaryBankswift!: string;

    constructor() {
        this.address = new Address();
    }
}