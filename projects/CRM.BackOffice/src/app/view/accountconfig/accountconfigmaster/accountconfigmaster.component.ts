import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AccountingconfigService } from '../../../services/accounting/accountingconfig.service';
import { AlertdialogService } from 'shared/views';
import { LedgerType, listCurrencyType, listLedgerGroupNatureItems, OriginValue, TextEnum, TransactionType, UtilityService } from 'shared/services';
import { AccountingConfig, CurrencyConfig, EmployeeDNorm, Ledger, MarketingEmail } from '../../../entities';
import { LedgerDNorm, LedgerGroup, TaxType, TransactItemGroup } from '../../../entities';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { EmployeeService, LedgerService } from '../../../services';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Address } from 'shared/businessobjects';
import { fxCredential } from 'shared/enitites';

@Component({
  selector: 'app-accountconfigmaster',
  templateUrl: './accountconfigmaster.component.html',
  styleUrls: ['./accountconfigmaster.component.css']
})
export class AccountconfigmasterComponent implements OnInit {

  public transactionType = TransactionType;
  public ledgerType = LedgerType
  public accConfigEnum = TextEnum;
  public showPopup: boolean = false;
  public editMode: boolean = false;
  public accountingConfigData: AccountingConfig = new AccountingConfig();
  public groupTitle: string[] = ['Ledger Group', 'Tax Type', 'Transaction Item Group', 'Sales Ledger', 'Purchase Ledger', 'Currency Type', 'Memo Process', 'Cash Handling Ledger', 'Interest Ledger', 'Expense Ledger', 'Logistic Charge Ledger'];
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public isAddLedgerGroup: boolean = false;
  public ledgerGroupObj: LedgerGroup = new LedgerGroup();
  public isAddTaxType: boolean = false;
  public taxTypeObj: TaxType = new TaxType();
  public isAddCurrencyConfig: boolean = false;
  public currencyConfigObj: CurrencyConfig = new CurrencyConfig();
  public isAddTransactionItemGroup: boolean = false;
  public transactItemGroupObj: TransactItemGroup = new TransactItemGroup();
  public isAddMemoProcess: boolean = false;
  public memoProcessName: string = '';
  public changeInvoiceNumflag: boolean = false;
  public changeSalesLedgerflag: boolean = false;
  public changePurchaseLedgerflag: boolean = false;
  public changeLocalInvoiceNumflag: boolean = false;
  public changeOverSeaInvoiceNumflag: boolean = false;
  public changeLocalMemoNumflag: boolean = false;
  public changeExportMemoNumflag: boolean = false;
  public changeExportMemoReturnNumflag: boolean = false;
  public changeProformaInvoiceNumflag: boolean = false;
  public changeCertificateNumflag: boolean = false;
  public changeDDANumflag: boolean = false;
  public addAmountLimitFlag: boolean = false;
  public addlastInvoiceNumFlag: boolean = false;
  public listLedgerItems: Array<{ text: string; value: string }> = [];
  public ledgerItems: Ledger[] = [];
  public selectedSalesLedger: string = "";
  public selectedPurcahseLedger: string = "";
  public selectedExpenceLedger: string = "";
  public selectedLogisticChargeLedger: string = "";
  public selectedInterestLedger: string = "";
  public selectedCashHandlingLedger: string = ""
  public listCurrencyConfig: Array<{ text: string; value: string }> = [];
  public listLedgerGroupNatureItems = listLedgerGroupNatureItems;
  public listParentLedgerGroupItems: string[] = [];
  public IsBankParent: boolean = false;
  private fxCredential!: fxCredential;
  public isViewButtons: boolean = false;
  public listOPManagers: Array<{ text: string; value: string, isChecked: boolean }> = [];
  public selectedOpManagerNames: Array<string> = new Array<string>();
  public opManagerItems: EmployeeDNorm[] = Array<EmployeeDNorm>();
  public opManagerSelectedItems: EmployeeDNorm[] = Array<EmployeeDNorm>();
  public filterOpManager: Array<string> = new Array<string>();
  public filterOpManagerChk: boolean = false;
  public isMarketingEditable = false;
  public tempEmailConfig: MarketingEmail = new MarketingEmail();

  constructor(
    private spinnerService: NgxSpinnerService,
    private accountingconfigService: AccountingconfigService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private ledgerService: LedgerService,
    private employeeService: EmployeeService,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region Init Data
  public async defaultMethodsLoad() {
    try {
      this.spinnerService.show();
      this.fxCredential = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      if (!this.fxCredential)
        this.router.navigate(["login"]);

      if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin' || this.fxCredential.origin.toLowerCase() == 'accounts'))
        this.isViewButtons = true;

      await this.loadOpManagersDNormList();
      await this.loadAccountConfigDetail();
      await this.loadLedgerTypes();
      Object.values(listCurrencyType).forEach(z => { this.listCurrencyConfig.push({ text: z.toString(), value: z.toString() }); });
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
    }
  }

  public async loadOpManagersDNormList() {
    this.opManagerItems = await this.employeeService.getEmployeeDNormByOriginType(OriginValue.OPManager.toString()) ?? new Array<EmployeeDNorm>();
    if (this.opManagerItems.length > 0)
      this.opManagerItems.forEach((z: EmployeeDNorm) => { this.listOPManagers.push({ text: z.name, isChecked: false, value: z.id }); });
  }

  public async loadAccountConfigDetail() {
    try {
      this.spinnerService.show();
      this.accountingConfigData = await this.accountingconfigService.getAccoutConfig();
      if (this.accountingConfigData.ledgerGroups) {
        let sortledgerGroups = this.accountingConfigData.ledgerGroups.sort((x, y) => x.name > y.name ? 1 : x.name < y.name ? -1 : 0)
        this.accountingConfigData.ledgerGroups = [];
        this.accountingConfigData.ledgerGroups = sortledgerGroups;
      }
      if (this.accountingConfigData && this.accountingConfigData.ledgerGroups)
        this.listParentLedgerGroupItems = this.accountingConfigData.ledgerGroups.map(z => z.name);
      if (this.accountingConfigData && this.accountingConfigData.opManagerList.length > 0) {
        if (this.listOPManagers.length > 0) {
          this.filterOpManager = this.accountingConfigData.opManagerList.map(x => x.id);
          this.onMultiSelectChange(this.listOPManagers, this.filterOpManager)
        }
      }
      if (!this.accountingConfigData.marketingEmail)
        this.accountingConfigData.marketingEmail = new MarketingEmail();
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async loadLedgerTypes() {
    try {
      this.ledgerItems = await this.ledgerService.getAllLedgers();
      if (this.ledgerItems.length > 0) {
        this.listLedgerItems = [];
        this.ledgerItems.forEach(element => {
          this.listLedgerItems.push({ text: element.name, value: element.id, });
        });
        this.selectedSalesLedger = this.accountingConfigData.salesLedger.idents[0] ?? "" as string;
        this.selectedPurcahseLedger = this.accountingConfigData.purchaseLedger.idents[0] ?? "" as string;
        this.selectedCashHandlingLedger = this.accountingConfigData.cashHandlingLedger?.idents[0] ?? ""  as string;
        this.selectedLogisticChargeLedger = this.accountingConfigData.logisticChargeLedger?.idents[0] ?? "" as string;
        this.selectedInterestLedger = this.accountingConfigData.interestLedger?.idents[0] ?? "" as string;
        this.selectedExpenceLedger = this.accountingConfigData.expenseLedger?.idents[0] ?? "" as string;
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public onLedgerChanges(event: any, type: string): void {
    let selectedLedger = this.ledgerItems.find(x => x.id == event);
    this.alertDialogService.ConfirmYesNo(`Sure, You want to change ledger?`, "Update").subscribe(async (res: any) => {
      if (res.flag) {
        let ledgerDNormObj: LedgerDNorm = new LedgerDNorm();
        ledgerDNormObj.id = selectedLedger?.id ? selectedLedger?.id : "";
        ledgerDNormObj.idents.push(selectedLedger?.id ?? "");
        ledgerDNormObj.group = selectedLedger?.group?.name ? selectedLedger?.group?.name : "";
        ledgerDNormObj.name = selectedLedger?.name ? selectedLedger?.name : "";
        ledgerDNormObj.contactPerson = selectedLedger?.contactPerson ? selectedLedger?.contactPerson : "";
        ledgerDNormObj.email = selectedLedger?.email ? selectedLedger?.email : "";
        ledgerDNormObj.mobileNo = selectedLedger?.mobileNo ? selectedLedger?.mobileNo : "";
        ledgerDNormObj.phoneNo = selectedLedger?.phoneNo ? selectedLedger?.phoneNo : "";
        ledgerDNormObj.faxNo = selectedLedger?.faxNo ? selectedLedger?.faxNo : "";
        let address = new Address();
        address.id = selectedLedger?.address.id ? selectedLedger?.address.id : "";
        address.type = selectedLedger?.address.type ? selectedLedger?.address.type : "";;
        address.line1 = selectedLedger?.address.line1 ? selectedLedger?.address.line1 : "";
        address.line2 = selectedLedger?.address.line2 ? selectedLedger?.address.line2 : "";
        address.city = selectedLedger?.address.city ? selectedLedger?.address.city : "";
        address.state = selectedLedger?.address.state ? selectedLedger?.address.state : "";;
        address.country = selectedLedger?.address.country ? selectedLedger?.address.country : "";
        address.zipCode = selectedLedger?.address.zipCode ? selectedLedger?.address.zipCode : "";
        ledgerDNormObj.address = address;

        if (type === this.transactionType.Sales)
          await this.updateSalesLedger(ledgerDNormObj);
        else if (type === this.transactionType.Purchase)
          await this.updatePurchaseLedger(ledgerDNormObj);
        else
          await this.updateDefaultLedgers(ledgerDNormObj, type);

      } else {
        this.selectedSalesLedger = this.accountingConfigData.salesLedger.idents[0] ?? "" as string;
        this.selectedPurcahseLedger = this.accountingConfigData.purchaseLedger.idents[0] ?? "" as string;
      }

      await this.loadAccountConfigDetail();
      await this.loadLedgerTypes();
    });
  }
  //#endregion

  //#region purcahse Ledger
  public changePurchaseLedger(): void {
    this.changePurchaseLedgerflag = true;
  }

  public async updateDefaultLedgers(ledgerDNormObj: LedgerDNorm, type: string) {
    var result = await this.accountingconfigService.updateDefaultLedger(ledgerDNormObj, type);
    if (result) {
      this.utilityService.showNotification('Update Successfully');
      this.changePurchaseLedgerflag = false;
    }
    else
      this.alertDialogService.show('Already updated, try new', 'error')
  }

  public async updatePurchaseLedger(purchaseLedger: LedgerDNorm) {
    var result = await this.accountingconfigService.updatePurchaseLedger(purchaseLedger);
    if (result) {
      this.utilityService.showNotification('Update Successfully');
      this.changePurchaseLedgerflag = false;
      await this.accountingconfigService.getPurchaseLedger();
    }
    else
      this.alertDialogService.show('Already updated, try new', 'error')
  }

  public closePurchaseLedgerUpdate(): void {
    this.changePurchaseLedgerflag = false;
    this.loadAccountConfigDetail();
  }
  //#endregion

  //#region Invoice Number
  public changeInvoiceNum(): void {
    this.changeInvoiceNumflag = true;
  }

  public async updateInvoiceNumber(invoiceno: number) {
    var result = await this.accountingconfigService.updateLastInvoiceNum(invoiceno);
    if (result) {
      this.utilityService.showNotification('Update Successfully');
      this.changeInvoiceNumflag = false;
      await this.accountingconfigService.getLastInvoiceNum();
    }
    else
      this.alertDialogService.show('Already updated, try new', 'error')
  }

  public closeInvoiceNum(): void {
    this.changeInvoiceNumflag = false;
  }
  //#endregion

  //#region Prefix & Numbers
  public async updatePrefixAndNumber() {
    var result = await this.accountingconfigService.updatePrefixAndNums(this.accountingConfigData);
    if (result) {
      this.utilityService.showNotification('Update Successfully');
      this.changeLocalInvoiceNumflag = false;
      this.changeOverSeaInvoiceNumflag = false;
      this.changeLocalMemoNumflag = false;
      this.changeExportMemoNumflag = false;
      this.changeExportMemoReturnNumflag = false;
      this.changeProformaInvoiceNumflag = false;
      this.changeCertificateNumflag = false;
      this.changeDDANumflag = false;
      this.addAmountLimitFlag = false;
      this.addlastInvoiceNumFlag = false;
    }
    else
      this.alertDialogService.show('Already updated, try new', 'error')
  }

  public changeLocalInvoiceNum(): void {
    this.changeLocalInvoiceNumflag = true;
  }

  public closeLocalInvoiceNum(): void {
    this.changeLocalInvoiceNumflag = false;
    this.loadAccountConfigDetail();
  }

  public changeOverSeaInvoiceNum(): void {
    this.changeOverSeaInvoiceNumflag = true;
  }

  public closeOverSeaInvoiceNum(): void {
    this.changeOverSeaInvoiceNumflag = false;
    this.loadAccountConfigDetail();
  }

  public changeLocalMemoNum(): void {
    this.changeLocalMemoNumflag = true;
  }

  public closeLocalMemoNum(): void {
    this.changeLocalMemoNumflag = false;
    this.loadAccountConfigDetail();
  }

  public changeExportMemoNum(): void {
    this.changeExportMemoNumflag = true;
  }

  public closeExportMemoNum(): void {
    this.changeExportMemoNumflag = false;
    this.loadAccountConfigDetail();
  }

  public changeExportMemoReturnNum(): void {
    this.changeExportMemoReturnNumflag = true;
  }

  public closeExportMemoReturnNum(): void {
    this.changeExportMemoReturnNumflag = false;
    this.loadAccountConfigDetail();
  }

  public changeProformaInvoiceNum(): void {
    this.changeProformaInvoiceNumflag = true;
  }

  public closeProformaInvoiceNum(): void {
    this.changeProformaInvoiceNumflag = false;
    this.loadAccountConfigDetail();
  }

  public changelastInvoiceNumFlag(): void {
    this.addlastInvoiceNumFlag = true;
  }

  public closelastInvoiceNumFlag(): void {
    this.addlastInvoiceNumFlag = false;
    this.loadAccountConfigDetail();
  }

  public changeAddAmountLimitFlag(): void {
    this.addAmountLimitFlag = true;
  }

  public closeAddAmountLimitFlag(): void {
    this.addAmountLimitFlag = false;
    this.loadAccountConfigDetail();
  }

  public changeCertificateFlag(): void {
    this.changeCertificateNumflag = true;
  }

  public closeCertificateFlag(): void {
    this.changeCertificateNumflag = false;
    this.loadAccountConfigDetail();
  }

  public changeDDAFlag(): void {
    this.changeDDANumflag = true;
  }

  public closeDDAFlag(): void {
    this.changeDDANumflag = false;
    this.loadAccountConfigDetail();
  }
  //#endregion

  //#region Sales Ledger
  public changeSalesLedger(): void {
    this.changeSalesLedgerflag = true;
  }

  public async updateSalesLedger(salesLedger: LedgerDNorm) {
    await this.accountingconfigService.updateSalesLedgerAsync(salesLedger).then(async (result) => {
      if (result) {
        this.utilityService.showNotification('Update Successfully');
        this.changeSalesLedgerflag = false;
        await this.accountingconfigService.getSalesLedger();
      }
      else
        this.alertDialogService.show('Already updated, try new', 'error');
    }).catch((error) => {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error, 'Error');
    });

  }

  public closeSalesLedgerUpdate(): void {
    this.changeSalesLedgerflag = false;
    this.loadAccountConfigDetail();
  }
  //#endregion

  //#region Ledger Group
  public openAddPopup(value: string): void {
    this.showPopup = true;
    this.editMode = false;

    if (value == TextEnum.LedgerGroup)
      this.isAddLedgerGroup = true;

    if (value == TextEnum.TaxType)
      this.isAddTaxType = true;

    if (value == TextEnum.TransactGroup)
      this.isAddTransactionItemGroup = true;

    if (value == TextEnum.CurrencyType) {
      this.isAddCurrencyConfig = true;
      this.currencyConfigObj = new CurrencyConfig();
      this.ledgerGroupObj = new LedgerGroup();
    }

    if (value == TextEnum.MemoProcess)
      this.isAddMemoProcess = true;
  }

  public closePopup(value: string): void {
    if (value == TextEnum.LedgerGroup || value == TextEnum.TaxType || value == TextEnum.TransactGroup || value == TextEnum.CurrencyType || value == TextEnum.MemoProcess)
      this.closePopupOnEsc();
  }

  public closePopupOnEsc(): void {
    this.showPopup = false;
    this.isAddLedgerGroup = false;
    this.isAddTaxType = false;
    this.isAddTransactionItemGroup = false;
    this.isAddCurrencyConfig = false;
    this.isAddMemoProcess = false;
    this.loadAccountConfigDetail();
  }

  public async addNew(value: string, continuity: boolean, form: NgForm) {
    try {
      if (!form.valid)
        return;

      if (value == TextEnum.LedgerGroup) {
        this.ledgerGroupObj.isDefault = false;
        var result = await this.accountingconfigService.ledgerGroupInsert(this.ledgerGroupObj);
        if (result) {
          this.utilityService.showNotification('Save successfully..!!!');
          if (continuity)
            this.ledgerGroupObj = new LedgerGroup();
          else {
            this.showPopup = false;
            this.isAddLedgerGroup = false;
            this.ledgerGroupObj = new LedgerGroup();
          }
        }
        else
          this.alertDialogService.show('Data not save, Try again later!');

      }
      if (value == TextEnum.TaxType) {
        var result = await this.accountingconfigService.taxTypeInsert(this.taxTypeObj);
        if (result) {
          this.utilityService.showNotification('Save successfully..!!!');
          if (continuity)
            this.ledgerGroupObj = new LedgerGroup();
          else {
            this.showPopup = false;
            this.isAddTaxType = false;
            this.taxTypeObj = new TaxType();
          }
        }
        else
          this.alertDialogService.show('Data not save, Try again later!');
      }
      if (value == TextEnum.TransactGroup) {
        var result = await this.accountingconfigService.insertTransactItemGroup(this.transactItemGroupObj);
        if (result) {
          this.utilityService.showNotification('Save successfully..!!!');
          if (continuity)
            this.ledgerGroupObj = new LedgerGroup();
          else {
            this.showPopup = false;
            this.isAddTransactionItemGroup = false;
            this.transactItemGroupObj = new TransactItemGroup();
          }
        }
        else
          this.alertDialogService.show('Data not save, Try again later!');
      }
      if (value == TextEnum.CurrencyType) {
        var result = await this.accountingconfigService.currencyConfigInsert(this.currencyConfigObj);

        if (result == 'false') {
          this.alertDialogService.show('Already Exist!');
          return;
        }

        if (result) {
          this.utilityService.showNotification('Save successfully..!!!');
          if (continuity)
            this.ledgerGroupObj = new LedgerGroup();
          else {
            this.showPopup = false;
            this.isAddCurrencyConfig = false;
            this.currencyConfigObj = new CurrencyConfig();
          }
        }
        else
          this.alertDialogService.show('Data not save, Try again later!');
      }
      if (value == TextEnum.MemoProcess) {
        var result = await this.accountingconfigService.memoProcessInsert(this.memoProcessName);

        if (result == 'false') {
          this.alertDialogService.show('Already Exist!');
          return;
        }

        if (result) {
          this.utilityService.showNotification('Save successfully..!!!');
          if (continuity)
            this.memoProcessName = '';
          else {
            this.showPopup = false;
            this.isAddMemoProcess = false;
            this.memoProcessName = '';
          }
        }
        else
          this.alertDialogService.show('Data not save, Try again later!');
      }
      this.loadAccountConfigDetail();
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Data not save, Try again later!');
    }

  }

  public deleteExisting(value: string, dataObj: any): void {
    var responseDelete: boolean = false;
    if (!dataObj.isDefault) {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          try {
            if (value == TextEnum.LedgerGroup && res.flag) {
              let exists = this.checkExistsInLedger(dataObj);
              if (exists != null) {
                this.alertDialogService.show(exists);
                return;
              }

              responseDelete = await this.accountingconfigService.deleteLedgerGroup(dataObj.id);
            }
            if (value == TextEnum.TaxType && res.flag)
              responseDelete = await this.accountingconfigService.deleteTaxType(dataObj.id);
            if (value == TextEnum.TransactGroup && res.flag)
              responseDelete = await this.accountingconfigService.deleteTransactItemGroup(dataObj.id);
            if (value == TextEnum.CurrencyType && res.flag)
              responseDelete = await this.accountingconfigService.deleteCurrencyConfig(dataObj.id);
            if (value == TextEnum.MemoProcess && res.flag)
              responseDelete = await this.accountingconfigService.deleteMemoProcess(dataObj);

            if (responseDelete !== undefined && responseDelete !== null && responseDelete == true) {
              this.loadAccountConfigDetail();
              this.utilityService.showNotification('Deleted Successfully');
            }
            else
              this.alertDialogService.show('Data not delete, Try again later!');
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();

            if (error && error.error && error.error?.toString()?.includes('already exists'))
              this.alertDialogService.show(error.error);
            else
              this.alertDialogService.show('Data not delete, Try again later!');
          }
        });
    } else
      this.alertDialogService.show(`Default ledger gorup is not alllow to delete.`);
  }

  public checkExistsInLedger(group: LedgerGroup): string | null {
    let existsParent = this.accountingConfigData.ledgerGroups.find(z => z.parent?.toLowerCase() == group.name.toLowerCase());
    if (existsParent != null)
      return 'This ledger group already exists as parent in ' + existsParent.name;
    else {
      let existsLedger = this.ledgerItems.find(z => z.group.name == group.name);
      if (existsLedger != null)
        return 'This ledger group is being used in ' + existsLedger.name;
      else
        return null;
    }
  }

  public editExisting(value: string, dataObj: any): void {

    this.showPopup = true;
    this.editMode = true;

    if (value == TextEnum.LedgerGroup) {
      this.isAddLedgerGroup = true;
      this.ledgerGroupObj = JSON.parse(JSON.stringify(dataObj));
    }
    if (value == TextEnum.TaxType) {
      this.isAddTaxType = true;
      this.taxTypeObj = JSON.parse(JSON.stringify(dataObj));
    }
    if (value == TextEnum.TransactGroup) {
      this.isAddTransactionItemGroup = true;
      this.transactItemGroupObj = JSON.parse(JSON.stringify(dataObj));
    }
    if (value == TextEnum.CurrencyType) {
      this.isAddCurrencyConfig = true;
      this.currencyConfigObj = JSON.parse(JSON.stringify(dataObj));
    }
  }

  public async updateSelected(value: string, dataObj: any, form: NgForm) {
    try {
      if (!form.valid)
        return;

      if (value == TextEnum.LedgerGroup) {
        let result = await this.accountingconfigService.updateLedgerGroupAsync(dataObj);
        if (result) {
          this.showPopup = false;
          this.isAddLedgerGroup = false;
          this.editMode = false;
        }
      }
      if (value == TextEnum.TaxType) {
        let result = await this.accountingconfigService.updateTaxType(dataObj);
        if (result) {
          this.showPopup = false;
          this.isAddTaxType = false;
          this.editMode = false;
        }
      }
      if (value == TextEnum.TransactGroup) {
        let result = await this.accountingconfigService.updateTransactItemGroup(dataObj);
        if (result) {
          this.showPopup = false;
          this.isAddTransactionItemGroup = false;
          this.editMode = false;
        }
      }
      if (value == TextEnum.CurrencyType) {
        let result = await this.accountingconfigService.updateCurrencyConfig(dataObj);
        if (result) {
          this.showPopup = false;
          this.isAddCurrencyConfig = false;
          this.editMode = false;
        }
      }
      this.loadAccountConfigDetail();
      this.utilityService.showNotification('Update Successfully');
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Data not update, Try again later!')
    }
  }

  public async checkISBank() {
    try {
      if (this.ledgerGroupObj.parent) {
        if (this.ledgerGroupObj.parent == "Bank" || this.ledgerGroupObj.parent == "Bank Accounts") {
          this.ledgerGroupObj.isBankLedger = true;
          this.IsBankParent = true;
        }
        else {
          this.ledgerGroupObj.isBankLedger = false;
          this.IsBankParent = false;
        }
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion


  public onMultiSelectChange(val: Array<{ text: string; value: string, isChecked: boolean }>, selectedData: string[]): void {
    this.selectedOpManagerNames = new Array<string>();
    this.opManagerSelectedItems = new Array<EmployeeDNorm>();
    val.forEach(element => {
      element.isChecked = false;
    });

    if (selectedData && selectedData.length > 0) {
      val.forEach(element => {
        selectedData.forEach(item => {
          if (element.value == item) {
            element.isChecked = true;
            this.selectedOpManagerNames.push(element.text);
            let findOpmanager = this.opManagerItems.find(x => x.id == element.value);
            if (findOpmanager)
              this.opManagerSelectedItems.push(findOpmanager);
          }
        });
      });
    }
  }

  public onOpenDropdown(list: Array<{ text: string; value: string, isChecked: boolean }>, e: boolean, selectedData: string[]): boolean {
    if (selectedData?.length == list.map(z => z.value).length)
      e = true;
    else
      e = false;
    return e;
  }

  public addOrUpdateOpManagerNotifyList() {
    this.alertDialogService.ConfirmYesNo("Are you want to made changes on OpManager Notify List?", "OpManager Notify List")
      .subscribe(async (res: any) => {
        try {
          if (res.flag) {
            if (JSON.stringify(this.accountingConfigData.opManagerList) == JSON.stringify(this.opManagerSelectedItems))
              return this.utilityService.showNotification('Your changes are submitted successfully!');
            let response = await this.accountingconfigService.addOrUpdateOpManagerList(this.opManagerSelectedItems);
            if (response) {
              this.accountingConfigData.opManagerList = this.opManagerSelectedItems;
              this.utilityService.showNotification('Your changes are submitted successfully!')
            }
          }
        }
        catch (error: any) {
          console.error(error);
          this.alertDialogService.show('Data not save, Try again later!');
        }
      });
  }

  public enableMarketingSaveChanges() {
    this.isMarketingEditable = true;
    this.tempEmailConfig = JSON.parse(JSON.stringify(this.accountingConfigData.marketingEmail));
  }

  public disabledMarketingConfiguration() {
    this.isMarketingEditable = false;
    this.accountingConfigData.marketingEmail = this.tempEmailConfig;
  }

  public async updateMarketingEmail() {
    try {
      this.spinnerService.show();
      var result = await this.accountingconfigService.updateMarketingEmail(this.accountingConfigData);
      if (result) {
        this.utilityService.showNotification('Update Successfully');
        this.isMarketingEditable = false;
        this.spinnerService.hide();
      }
      else {
        this.alertDialogService.show('Already updated, try new', 'error');
        this.spinnerService.hide();
      }
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Email config not save, Try again later!');
    }
  }

}
