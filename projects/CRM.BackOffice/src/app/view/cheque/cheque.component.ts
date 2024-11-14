import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { GridDetailConfig } from 'shared/businessobjects';
import { AppPreloadService, ConfigService, TransactionType, UtilityService } from 'shared/services';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertdialogService } from 'shared/views/common/alertdialog/alertdialog.service';
import { fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { ChequeService, GridPropertiesService, LedgerService, TransactionService } from '../../services';
import { ChequeResponse, ChequeSearchCriteria } from '../../businessobjects';
import { ChequeReconciliation, LedgerDNorm, Transaction } from '../../entities';

@Component({
  selector: 'app-cheque',
  templateUrl: './cheque.component.html',
  styleUrls: []
})
export class ChequeComponent implements OnInit {

  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0
  public gridView!: DataResult;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = { mode: 'single', };
  public mySelection: string[] = [];
  public fields!: GridDetailConfig[];
  public skeletonArray = new Array(18);
  public chequeReconciliationObj: ChequeReconciliation = new ChequeReconciliation();
  public tempCompanyObj!: string;
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public searchCriteria: ChequeSearchCriteria = new ChequeSearchCriteria();
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public currentChequeReconciliations: ChequeReconciliation[] = [];
  public listPartyItems: Array<{ text: string; value: string }> = [];
  public partyItems: LedgerDNorm[] = [];
  public chequeTransactionObj: Transaction = new Transaction();

  constructor(
    private gridPropertiesService: GridPropertiesService,
    private router: Router,
    public utilityService: UtilityService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private appPreloadService: AppPreloadService,
    private chequeService: ChequeService,
    private ledgerService: LedgerService,
    private transactionService: TransactionService
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);
    await this.getGridConfiguration();
    await this.loadCheque();
    await this.loadParty();
    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "ChequeReconciliation", "ChequeReconciliationGrid", this.gridPropertiesService.getChequeGrid());
      if (this.gridConfig && this.gridConfig.id != '') {
        let dbObj: GridDetailConfig[] = this.gridConfig.gridDetail;
        if (dbObj && dbObj.some(c => c.isSelected)) {
          this.fields = dbObj;
          this.fields.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        }
        else
          this.fields.forEach(c => c.isSelected = true);
      }
      else {
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("ChequeReconciliation", "ChequeReconciliationGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getChequeGrid();
      }
    } catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public async loadParty() {
    try {
      let partys = await this.ledgerService.getAllLedgers();
      for (let index = 0; index < partys.length; index++) {
        const element = partys[index];
        this.partyItems.push({
          id: element.id,
          group: element.group.name,
          name: element.name,
          code: element.code,
          contactPerson: element.contactPerson,
          email: element.email,
          mobileNo: element.mobileNo,
          phoneNo: element.phoneNo,
          faxNo: element.faxNo,
          address: element.address,
          idents: element.idents,
          incomeTaxNo: element.incomeTaxNo,
          taxNo: element.taxNo
        });
      }
      this.listPartyItems = [];
      this.partyItems.forEach(z => { this.listPartyItems.push({ text: z.name, value: z.id }); });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Party not load, Try gain later!');
    }
  }

  public async loadCheque() {
    try {
      let res: ChequeResponse = await this.chequeService.getCheque(this.searchCriteria, this.skip, this.pageSize);
      this.gridView = process(res.chequeReconciliations, { group: this.groups });
      this.gridView.total = res.totalCount;
      this.currentChequeReconciliations = [];
      this.currentChequeReconciliations = res.chequeReconciliations;
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadCheque();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadCheque();
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public onFilterSubmit(form: NgForm) {
    this.skip = 0
    this.loadCheque()
  }

  public clearFilter(form: NgForm) {
    form.reset()
    this.searchCriteria = new ChequeSearchCriteria()
    this.loadCheque();
  }

  public refreshPage(action: boolean, form: NgForm, messageType: string) {
    this.loadCheque();
    this.mySelection = [];
    this.resetForm(form);
    this.chequeReconciliationObj = new ChequeReconciliation();
    this.spinnerService.hide();
  }

  public resetForm(form?: NgForm) {
    this.chequeReconciliationObj = new ChequeReconciliation();
    form?.reset();
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public setNewGridConfig(gridConfig: GridConfig) {
    try {
      if (gridConfig) {
        this.fields = gridConfig.gridDetail;
        this.gridConfig = new GridConfig();
        this.gridConfig.id = gridConfig.id
        this.gridConfig.gridDetail = gridConfig.gridDetail;
        this.gridConfig.gridName = gridConfig.gridName;
        this.gridConfig.pageName = gridConfig.pageName;
        this.gridConfig.empID = gridConfig.empID;
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async updateCleared() {
    if (this.mySelection.length > 0) {
      this.chequeReconciliationObj = this.currentChequeReconciliations.find(x => this.mySelection[0] == x.id) ?? null as any;
      if (this.chequeReconciliationObj != null) {
        if (this.chequeReconciliationObj.isCleared == true) {
          this.alertDialogService.show('This cheque already cleared!');
          return;
        }

        if (this.chequeReconciliationObj.isReturn == true) {
          this.alertDialogService.show("You can't clear returned cheque, Please reset first.");
          return;
        }

        this.alertDialogService.ConfirmYesNo("Are you sure you want to clear cheque", "Clear")
          .subscribe(async (res: any) => {
            if (res.flag) {
              try {
                this.spinnerService.show();
                let res = await this.chequeService.chequeClearUpdate(this.chequeReconciliationObj.id);
                if (res) {
                  this.loadCheque();
                  this.utilityService.showNotification('Cheque Cleared Successfully!');
                  this.spinnerService.hide();
                }
                else {
                  this.alertDialogService.show("Something went wrong, Try again later");
                  this.spinnerService.hide();
                }
              } catch (error: any) {
                console.error(error);
                this.spinnerService.hide();
                this.alertDialogService.show("Something went wrong, Try again later");
              }
            }
          });

      }
      else
        this.alertDialogService.show("Cheque not found, Please contact administrator!");
    }
  }

  public async updateReturn() {
    if (this.mySelection.length > 0) {
      this.chequeReconciliationObj = this.currentChequeReconciliations.find(x => this.mySelection[0] == x.id) ?? null as any;
      if (this.chequeReconciliationObj != null) {
        if (this.chequeReconciliationObj.isCleared == true) {
          this.alertDialogService.show("You can't return cleared cheque.");
          return;
        }

        if (this.chequeReconciliationObj.isReturn == true) {
          this.alertDialogService.show("This cheque already returned!");
          return;
        }

        this.alertDialogService.ConfirmYesNo("Are you sure you want to return cheque", "Return")
          .subscribe(async (res: any) => {
            if (res.flag) {
              try {
                this.spinnerService.show();
                let res = await this.chequeService.chequeReturnUpdate(this.chequeReconciliationObj.id);
                if (res) {
                  this.loadCheque();
                  this.addChequeReturnEntryInRojmal(this.chequeReconciliationObj.transactionNumber);
                  this.utilityService.showNotification('Cheque Return Successfully!');
                  this.spinnerService.hide();
                }
                else {
                  this.alertDialogService.show("Something went wrong, Try again later");
                  this.spinnerService.hide();
                }
              } catch (error: any) {
                console.error(error);
                this.spinnerService.hide();
                this.alertDialogService.show("Something went wrong, Try again later");
              }
            }
          });

      }
      else
        this.alertDialogService.show("Cheque not found, Please contact administrator!");
    }
  }

  public async addChequeReturnEntryInRojmal(transactionNumber: string) {
    var transactionData = await this.transactionService.getbyNumber(transactionNumber);

    if (transactionData) {
      this.chequeTransactionObj.transactionType = TransactionType.Payment.toString();
      this.chequeTransactionObj.transactionDate = new Date();
      this.chequeTransactionObj.createdBy = this.fxCredential?.fullName;
      this.chequeTransactionObj.paymentDetail.chequeNo = transactionData?.paymentDetail?.chequeNo;
      this.chequeTransactionObj.paymentDetail.paymentType = "ChequeReturn";
      this.chequeTransactionObj.fromLedger = transactionData?.toLedger;
      this.chequeTransactionObj.toLedger = transactionData?.fromLedger;
      this.chequeTransactionObj.amount = transactionData?.amount;
      this.chequeTransactionObj.transactionDetail = transactionData?.transactionDetail;
      this.chequeTransactionObj.netTotal = transactionData?.netTotal;
      this.chequeTransactionObj.ccAmount = transactionData?.ccAmount;

      await this.transactionService.insert(this.chequeTransactionObj);
    }
  }

  public async updateReset() {
    if (this.mySelection.length > 0) {
      this.chequeReconciliationObj = this.currentChequeReconciliations.find(x => this.mySelection[0] == x.id) ?? null as any;
      if (this.chequeReconciliationObj != null) {
        if (this.chequeReconciliationObj.isCleared == true) {
          this.alertDialogService.show("You can't reset cleared cheque.");
          return;
        }

        this.alertDialogService.ConfirmYesNo("Are you sure you want to reset cheque", "Reset")
          .subscribe(async (res: any) => {
            if (res.flag) {
              try {
                this.spinnerService.show();
                let res = await this.chequeService.chequeResetUpdate(this.chequeReconciliationObj.id);
                if (res) {
                  this.loadCheque();
                  this.utilityService.showNotification('Cheque Reset Successfully!');
                  this.spinnerService.hide();
                }
                else {
                  this.alertDialogService.show("Something went wrong, Try again later");
                  this.spinnerService.hide();
                }
              } catch (error: any) {
                console.error(error);
                this.spinnerService.hide();
                this.alertDialogService.show("Something went wrong, Try again later");
              }
            }
          });
      }
      else
        this.alertDialogService.show("Cheque not found, Please contact administrator!");
    }
  }
}