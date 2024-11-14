import { BaseEntity } from "shared/enitites";
import { LedgerDNorm } from "./dnorm/ledgerdnorm";
import { LedgerGroup } from "./ledgergroup";
import { EmployeeDNorm } from "../employee/employeednorm";
import { TransactItemGroup } from "./transactitemgroup";
import { CurrencyConfig } from "./currencyconfig";
import { TaxType } from "./taxType";
import { MarketingEmail } from "../employee/marketingemail";

export class AccountingConfig extends BaseEntity {

    salesLedger: LedgerDNorm
    purchaseLedger: LedgerDNorm
    cashHandlingLedger: LedgerDNorm
    logisticChargeLedger: LedgerDNorm
    interestLedger: LedgerDNorm
    expenseLedger: LedgerDNorm
    lastInvoiceNum!: number
    localInvoicePrefix!: string;
    lastLocalInvoiceNum!: number;
    overseaInvoicePrefix!: string;
    lastOverSeaInvoiceNum!: number;
    localMemoPrefix!: string;
    lastLocalMemoNum!: number;
    exportMemoPrefix!: string;
    exportMemoReturnPrefix!: string;
    lastExportMemoNum!: number;
    lastExportMemoReturnNum!: number;
    proformaInvoicePrefix!: string;
    lastProformaInvoiceNum!: number;
    certificatePrefix!: string;
    lastCertificateNum!: number;
    ddaLocalPrefix!: string;
    lastDDALocalInvoiceNum!: number;
    addAmountLimit!: number;
    ledgerGroups!: LedgerGroup[]
    taxTypes!: TaxType[]
    transactItemGroups!: TransactItemGroup[]
    currencyConfigs!: CurrencyConfig[]
    memoProcess!: string[]
    opManagerList: Array<EmployeeDNorm>
    isSameNumber!: boolean
    marketingEmail: MarketingEmail

    constructor() {
        super();
        this.salesLedger = new LedgerDNorm();
        this.purchaseLedger = new LedgerDNorm();
        this.cashHandlingLedger = new LedgerDNorm();
        this.logisticChargeLedger = new LedgerDNorm();
        this.interestLedger = new LedgerDNorm();    
        this.expenseLedger = new LedgerDNorm();
        this.ledgerGroups = [];
        this.taxTypes = [];
        this.transactItemGroups = [];
        this.currencyConfigs = [];
        this.memoProcess = [];
        this.opManagerList = new Array<EmployeeDNorm>();
        this.isSameNumber = false;
        this.marketingEmail = new MarketingEmail();
    }
}