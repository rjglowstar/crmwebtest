import { LogisticDNorm, OrganizationDNorm } from "../../../businessobjects";
import { BankDNorm } from "../bankdnorm";
import { TaxType } from "../taxType";
import { LedgerDNorm } from "./ledgerdnorm";

export class TransactionDetail {
    termType!: string;
    terms!: string;
    expense!: string;
    fromCurrency!: string;
    fromCurRate!: number | null;
    toCurrency!: string;
    toCurRate!: number | null;
    shippingCharge!: number;
    isCOD!: boolean;
    isDelivered!: boolean;
    bank: BankDNorm;
    portOfLoading: string = "";
    logistic: LogisticDNorm;
    exportType: string = "";
    taxTypes: TaxType[];
    organization: OrganizationDNorm;
    isOverseas!: boolean;
    intermediaryBank!: string;
    additionalDeclaration!: string;
    dueDate!: Date;
    docketNo!: string;
    irnNo!: string;
    isPackingList!: boolean;
    isDDA!: boolean;
    plDeclaration!: string;
    consignee!: LedgerDNorm;
    consigneeName!: string;
    consigneeAddress!: string;
    boxWeight!: string;
    cifCityName!: string;
    isWithCertiNo!: boolean;
    isSkipInvEnum!: boolean
    isShowOrigin!: boolean

    constructor() {
        this.bank = new BankDNorm();
        this.logistic = new LogisticDNorm();
        this.consignee = new LedgerDNorm();
        this.taxTypes = new Array<TaxType>();
        this.organization = new OrganizationDNorm();
    }

}