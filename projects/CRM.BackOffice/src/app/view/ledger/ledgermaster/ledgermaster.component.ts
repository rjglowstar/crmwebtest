import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, SystemUserPermission } from 'shared/enitites';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { LedgerSearchCriteria } from '../../../businessobjects';
import { Ledger, LedgerGroup } from '../../../entities';
import { AccountingconfigService, CommuteService, GridPropertiesService } from '../../../services';
import { LedgerService } from '../../../services/ledger/ledger.service';
import { CustomerDNorm } from 'projects/CRM.FrontOffice/src/app/entities/customer/dnorm/customerdnorm';

@Component({
  selector: 'app-ledger',
  templateUrl: './ledgermaster.component.html',
  styleUrls: ['./ledgermaster.component.css']
})

export class LedgerMasterComponent implements OnInit {
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public isRegLedger: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public openedConfirmationLedgerDetails = false;
  public mySelection: string[] = [];
  public ledgerObj: Ledger = new Ledger();
  public listLedgerGroupItems: Array<LedgerGroup> = new Array<LedgerGroup>();
  public ledgerGroupIdForSearch!: string;
  public ledgerCriteria: LedgerSearchCriteria = new LedgerSearchCriteria();
  public isCanDeleteLedger: boolean = false;

  private fxCredential!: fxCredential;
  public isViewButtons: boolean = false;
  public isCustomerLinked: boolean = false;
  public customerItems: CustomerDNorm[] = [];

  constructor(
    private router: Router,
    private gridPropertiesService: GridPropertiesService,
    public utilityService: UtilityService,
    private ledgerService: LedgerService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private commuteService: CommuteService,
    private accountingconfigService: AccountingconfigService,
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.fxCredential = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin' || this.fxCredential.origin.toLowerCase() == 'accounts'))
      this.isViewButtons = true;

    this.fields = await this.gridPropertiesService.getLedgerGrid();
    await this.loadLedgers();
    await this.loadLedgerGroup();
    await this.setUserRights();
    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async setUserRights() {
    let userPermissions: SystemUserPermission = new SystemUserPermission();
    let sesValue = sessionStorage.getItem("userPermission");
    if (sesValue)
      userPermissions = JSON.parse(sesValue) as SystemUserPermission;
    if (userPermissions.actions.length > 0) {
      let CanDeleteLedger = userPermissions.actions.find(z => z.name == "CanDeleteLedger");
      if (CanDeleteLedger != null)
        this.isCanDeleteLedger = true;
    }
  }

  //#region List Ledgers
  public async loadLedgers() {
    try {
      let ledger: any = await this.ledgerService.getLedgersByCriteria(this.ledgerCriteria, this.skip, this.pageSize);
      this.gridView = process(ledger.ledgers, { group: this.groups });
      this.gridView.total = ledger.totalCount;
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public async loadLedgerGroup() {
    try {
      this.listLedgerGroupItems = [];
      let listLedgerGroups: LedgerGroup[] = await this.accountingconfigService.getLedgerGroups();
      if (listLedgerGroups.length > 0) {
        listLedgerGroups.sort((a, b) => (a.name < b.name ? -1 : 1));
        listLedgerGroups.forEach((item) => {
          if (item.name)
            this.listLedgerGroupItems.push(item)
        })
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }


  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadLedgers();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadLedgers();
  }
  //#endregion List Ledger

  //#region Filter Section
  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public selectedRowChange(e: any) {
    this.ledgerObj = new Ledger();
    let value: any = e.selectedRows[0].dataItem
    value.expiredDate = value.expiredDate ? this.utilityService.getValidDate(value.expiredDate) : '';
    this.ledgerObj = { ...value };
  }

  public onFilterSubmit(form: NgForm) {
    this.ledgerCriteria.group = this.listLedgerGroupItems.find(x => x.id == this.ledgerGroupIdForSearch)?.name ?? "";
    this.skip = 0
    this.loadLedgers()
  }

  public clearFilter(form: NgForm) {
    form.reset()
    this.ledgerCriteria = new LedgerSearchCriteria()
    this.loadLedgers()
  }
  //#endregion Filter Section

  //#region Ledger Modal
  public openAddOrUpdateLedgerDialog(type: string): void {
    if (type == "add")
      this.ledgerObj = new Ledger();
    this.isRegLedger = true;
  }

  public async openLinkedCustomer() {
    this.isCustomerLinked = true;
    if (this.ledgerObj.idents.length > 0 && this.ledgerObj.idents)
      for (let i = 0; i <= this.ledgerObj.idents.length; i++) {
        if (this.ledgerObj.idents[i]) {
          this.spinnerService.show();
          let customerDNorm: CustomerDNorm = await this.commuteService.getCustomerDNormByIdAsync(this.ledgerObj.idents[i]);
          if (customerDNorm) {
            this.customerItems.push(customerDNorm)
          }
          this.spinnerService.hide();
        }
      }
  }

  public closeCustomerLinked() {
    this.isCustomerLinked = false
    this.customerItems = [];
    this.mySelection=[];
  }

  public async onCustLinkedDelete(selectedItem: CustomerDNorm) {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
            this.mySelection = [];
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = await this.ledgerService.deleteLedgerIdent(selectedItem.id);

            if (responseDelete !== undefined && responseDelete !== null && responseDelete) {
              this.spinnerService.hide();
              await this.loadLedgers();
              this.utilityService.showNotification(`Data have been deleted successfully!`)
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show(`Something went wrong, Try again later.`);
            }
          }
          this.isCustomerLinked = false;
          this.customerItems = [];
        })
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public openDeleteDialog() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          this.mySelection = [];
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = await this.ledgerService.deleteLedger(this.ledgerObj.id)
            if (responseDelete !== undefined && responseDelete !== null) {
              this.loadLedgers();
              this.spinnerService.hide();
              this.utilityService.showNotification(`You have been deleted successfully!`)
            }
          }
        })
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public addedOrUpdatedLedger(event: any) {
    if (event.flag) {
      this.loadLedgers();
      this.mySelection = [];
      this.spinnerService.hide();
      this.utilityService.showNotification(`You have been ${event.type} successfully!`);
    }
  }
  //#endregion Party Modal

  public openLedgerRedirect(pagename: string) {
    this.router.navigate(["/ledger/" + pagename, this.ledgerObj.id]);
  }

}