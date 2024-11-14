import { Component, OnInit } from '@angular/core';
import { AlertdialogService } from 'shared/views';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppPreloadService, ConfigService, UtilityService } from 'shared/services';
import { fxCredential } from 'shared/enitites';
import { AccountingconfigService, BalanceSheetService } from '../../services';
import { Router } from '@angular/router';
import { BalanceSheet, BalanceSheetSearchCriteria } from '../../businessobjects';
import { AccountingConfig } from '../../entities';

@Component({
  selector: 'app-balancesheet',
  templateUrl: './balancesheet.component.html',
  styleUrls: ['./balancesheet.component.css']  
})
export class BalancesheetComponent implements OnInit {
  // Pre-filter setttings
  public filterFlag = true;

  public balanceSheetData: BalanceSheet[] = [];
  public accountingConfigData: AccountingConfig = new AccountingConfig();

  public assetsData: BalanceSheet[] = [];
  public liabilitiesData: BalanceSheet[] = [];

  public assetsTotal: number = 0.00;
  public liabilitiesTotal: number = 0.00;

  public balanceSheetSearchCriteria: BalanceSheetSearchCriteria = new BalanceSheetSearchCriteria();

  private fxCredential!: fxCredential;

  public isViewButtons: boolean = false;
  public ledgerSummaryData: any = [];

  constructor(
    private router: Router,
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
    private appPreloadService: AppPreloadService,
    private configService: ConfigService,
    public utilityService: UtilityService,
    private balanceSheetService: BalanceSheetService,
    private accountingconfigService: AccountingconfigService
  ) { }

  public async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region Initialize Data
  public async defaultMethodsLoad() {
    this.spinnerService.show();
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);
    else {
      await this.loadBalanceSheet();

      if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin' || this.fxCredential.origin.toLowerCase() == 'accounts'))
        this.isViewButtons = true;

      this.utilityService.filterToggleSubject.subscribe(flag => {
        this.filterFlag = flag;
      });
    }
  }

  public async loadBalanceSheet() {
    try {
      this.spinnerService.show();
      this.accountingConfigData = await this.accountingconfigService.getAccoutConfig();
      let res = await this.balanceSheetService.getBySearch(this.balanceSheetSearchCriteria);
      let ledgerData: any = [];

      if (res) {
        this.spinnerService.hide();
        //transation wise 
        res.forEach(item => {
          if (item.transactionType == "Sales") {
            ledgerData.push({ ...item.fromLedger, credit: item.amount, debit: 0, ccType: item.cCtype })
            ledgerData.push({ ...item.toLedger, credit: 0, debit: item.amount, ccType: item.cCtype })
          } else if (item.transactionType == "Purchase") {
            ledgerData.push({ ...item.fromLedger, credit: 0, debit: item.amount, ccType: item.cCtype })
            ledgerData.push({ ...item.toLedger, credit: item.amount, debit: 0, ccType: item.cCtype })
          } else if (item.transactionType == "Receipt") {
            ledgerData.push({ ...item.fromLedger, credit: item.amount, debit: 0, ccType: item.cCtype })
            ledgerData.push({ ...item.toLedger, credit: 0, debit: item.amount, ccType: item.cCtype })
          } else if (item.transactionType == "Payment") {
            ledgerData.push({ ...item.fromLedger, credit: item.amount, debit: 0, ccType: item.cCtype })
            ledgerData.push({ ...item.toLedger, credit: 0, debit: item.amount, ccType: item.cCtype })
          } else {
            ledgerData.push({ ...item.fromLedger, credit: item.amount, debit: 0, ccType: item.cCtype })
            ledgerData.push({ ...item.toLedger, credit: 0, debit: item.amount, ccType: item.cCtype })
          }
        });

        let groupByCurrencyType = this.groupByLedgerGroupAndCCtype(ledgerData.filter((x: any) => x.ccType != null), "group", "ccType")

        for (const key in groupByCurrencyType) {
          if (Object.hasOwnProperty.call(groupByCurrencyType, key)) {
            const totalDebit = groupByCurrencyType[key].reduce((sum: any, entry: any) => sum + entry.debit, 0);
            const totalCredit = groupByCurrencyType[key].reduce((sum: any, entry: any) => sum + entry.credit, 0);
            const total = totalCredit - totalDebit;

            const ledgerGroup = this.accountingConfigData.ledgerGroups.find(x => key.includes(`${x.name}_`));

            let record = { [key]: total, nature: ledgerGroup?.nature }
            this.ledgerSummaryData.push(record);
          }
        }
        this.assetsData = this.ledgerSummaryData.filter((x: any) => x.nature == "Assets")
        this.liabilitiesData = this.ledgerSummaryData.filter((x: any) => x.nature == "Liabilities")
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Balance sheet data not load, Try again later!');
      }

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Balance sheet data not load, Try again later!');
    }
  }

  getUniqueCurrencies() {
    return Array.from(new Set(this.ledgerSummaryData.map((item: any) => Object.keys(item)[0].split('_')[1])));
  }

  public getSumByCurrency(currency: any, nature: any) {
    let filteredItems = this.ledgerSummaryData.filter((item: any) => {
      let keys = Object.keys(item);
      let firstKey = keys[0];

      if (firstKey && firstKey.includes(currency) && item.nature === nature) {
        return true;
      }
      return false;
    });

    let sum = filteredItems.reduce((total: any, item: any) => {
      let values = Object.values(item);
      let firstKey = Object.keys(item)[0];

      // Check if the first key contains the currency
      if (firstKey && firstKey.includes(currency)) {
        // Exclude the 'nature' property and sum the values
        let filteredValues = values.filter(val => typeof val === 'number' && !isNaN(val));
        total += filteredValues.reduce((acc: any, val: any) => acc + val, 0);
      }
      return total;
    }, 0);

    return sum;
  }

  getGroupedByCurrency(currency: any, item: any) {
    return item.filter((item: any) => {
      const key = Object.keys(item)[0]; // Extract the key

      if (typeof key === 'string') {
        return key.includes(`_${currency}`);
      }
      return false;
    });
  }

  getObjectKeys(item: any): string[] {
    return item ? Object.keys(item) : [];
  }

  public groupByLedgerGroupAndCCtype(array: any, prop1: any, prop2: any) {
    return array.reduce((acc: any, obj: any) => {
      const key = `${obj[prop1]}_${obj[prop2]}`; // Combining two properties as a key
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});
  }

  public clearFilter() {
    if (this.balanceSheetSearchCriteria.fromDate || this.balanceSheetSearchCriteria.toDate) {
      this.ledgerSummaryData = [];
      this.loadBalanceSheet();
    }
    else
      return;

    this.balanceSheetSearchCriteria = new BalanceSheetSearchCriteria();
  }

  public flterBalanceSheet() {
    if (this.balanceSheetSearchCriteria.fromDate && this.balanceSheetSearchCriteria.toDate) {
      this.ledgerSummaryData = [];
      this.loadBalanceSheet();
    }
    else
      return;
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

}
