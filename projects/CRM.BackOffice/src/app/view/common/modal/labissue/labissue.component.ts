import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { CurrencyConfig, InventoryItems, Logistic } from '../../../../entities';
import { fromEvent } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import { CommonResponse, GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { AppPreloadService, ConfigService, FileStoreService, listCurrencyType, StoneStatus, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { Lab } from '../../../../businessobjects/lab/lab';
import { GridPropertiesService } from '../../../../services/grid/gridproperties.service';
import { LabService } from '../../../../services/lab/lab.service';
import { LogisticService } from '../../../../services/logistic/logistic.service';
import { LabIssueItem } from '../../../../businessobjects/lab/labissueitem';
import { AccountingconfigService, CommuteService, InventoryService } from '../../../../services';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { LabIssue } from 'projects/CRM.BackOffice/src/app/businessobjects/lab/labIssue';

@Component({
  selector: 'app-labissue',
  templateUrl: './labissue.component.html',
  styleUrls: ['./labissue.component.css']
})

export class LabissueComponent implements OnInit {
  @ViewChild('BarcodeInput') barcodeInput!: ElementRef;
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  @Input() stockOnHandSelectedItems: InventoryItems[] = [];
  @Input() inventoryItems: InventoryItems[] = [];
  @Input() isRepairProcess: boolean = false;

  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };

  public islabIssue: boolean = false;
  public groups: GroupDescriptor[] = [];
  public groupsIssue: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public skeletonArray = new Array(3);
  public mySelection: string[] = [];
  public isGridConfig: boolean = false;
  public fxCredentials?: fxCredential;
  private fxCredential!: fxCredential;
  public totalWeight: number = 0;
  public packetsItems!: InventoryItems[];
  public selectedInventoryItems: InventoryItems[] = [];
  public selectedInvalidInventoryItems: InventoryItems[] = [];
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public listStoneFilterItems: Array<{ text: string; value: string }> = [];
  public selectedPacketsItems?: { text: string, value: string };
  public cntMnuStones?: string;
  public sumMnuStonesWeight?: string;
  public gridViewLab!: DataResult;
  public labObj: Lab = new Lab();
  public labItems: Lab[] = [];
  public selectedLabItems?: { text: string, value: string };
  public listLabItems: Array<{ text: string; value: string }> = [];
  public logisticObj: Logistic = new Logistic();
  public logisticItems: Logistic[] = [];
  public selectedlogisticItems?: { text: string, value: string };
  public listlogisticItems: Array<{ text: string; value: string }> = [];
  public extraData: boolean = false;
  public labIssueObj: LabIssue = new LabIssue();
  public dRate: any;
  public canDownloadIssueExcel = false;
  public listCurrencyConfig: CurrencyConfig[] = [];
  public EnteredStoneID: string = "";

  constructor(
    private gridPropertiesService: GridPropertiesService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private inventoryService: InventoryService,
    private labService: LabService,
    private logisticService: LogisticService,
    public appPreloadService: AppPreloadService,
    public router: Router,
    private fileStoreService: FileStoreService,
    private accountingconfigService: AccountingconfigService,
    private commuteService: CommuteService
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region defaultMethods
  public async defaultMethodsLoad() {
    try {
      this.fxCredential = await this.appPreloadService.fetchFxCredentials();
      if (!this.fxCredential)
        this.router.navigate(["login"]);
      this.gridView = { data: [], total: 0 };
      await this.getData();
      await this.getGridConfiguration();
      this.onAddBarcode();
      this.loadStock();

      this.listCurrencyConfig = await this.accountingconfigService.getCurrencyConfigsList();
      if (this.listCurrencyConfig) {
        let res = this.accountingconfigService.getFromToCurrencyRate(listCurrencyType.USD, listCurrencyType.INR, this.listCurrencyConfig);
        this.labIssueObj.dollarRate = res.toRate;
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getData() {
    try {
      this.labItems = await this.labService.getAllLabs();
      this.listLabItems = [];
      this.labItems.forEach(z => { this.listLabItems.push({ text: z.name, value: z.name }); });
      this.logisticItems = await this.logisticService.getAllLogistics();
      this.listlogisticItems = [];
      this.logisticItems.forEach(z => { this.listlogisticItems.push({ text: z.name, value: z.name }); });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async loadStock() {
    try {
      let lab: string[] = [], memo: string[] = [], hold: string[] = [], pReq: string[] = [], pricing: string[] = [], mesurment: string[] = [], inclusion: string[] = [];
      let errorCount = 0;
      let pWaiting: string[] = [];

      this.stockOnHandSelectedItems.forEach((element: InventoryItems) => {
        let validate = this.checkLabIssueValidation(element);
        if (validate.success)
          this.selectedInventoryItems.push(element);
        else {
          errorCount++;
          if (validate.errorLab)
            lab.push(element.stoneId.toString());
          else if (validate.errorMemo)
            memo.push(element.stoneId.toString());
          else if (validate.errorHold)
            hold.push(element.stoneId.toString());
          else if (validate.errorPReq)
            pReq.push(element.stoneId.toString());
          else if (validate.errorPrice)
            pricing.push(element.stoneId.toString());
          else if (validate.errorMesu)
            mesurment.push(element.stoneId.toString());
          else if (validate.errorInc)
            inclusion.push(element.stoneId.toString());
          else if (validate.errorPWaiting)
            pWaiting.push(element.stoneId.toString());
        }
      });

      if (errorCount > 0) {
        let errorMessages = '';
        if (lab.length > 0)
          errorMessages = lab.join(', ') + ` <b>already in lab</b>`;
        if (memo.length > 0) {
          errorMessages.length > 0 ? errorMessages += ` </br></br> ` : '';
          errorMessages += memo.join(', ') + ' <b>in memo</b>';
        }
        if (hold.length > 0) {
          errorMessages.length > 0 ? errorMessages += ` </br></br> ` : '';
          errorMessages += hold.join(', ') + ' <b>in hold</b>';
        }
        if (pReq.length > 0) {
          errorMessages.length > 0 ? errorMessages += ` </br></br> ` : '';
          errorMessages += pReq.join(', ') + ' <b>in pricing request</b>';
        }
        if (pricing.length > 0) {
          errorMessages.length > 0 ? errorMessages += ` </br></br> ` : '';
          errorMessages += pricing.join(', ') + ' <b>pricing does not exists</b>';
        }
        if (mesurment.length > 0) {
          errorMessages.length > 0 ? errorMessages += ` </br></br> ` : '';
          errorMessages += mesurment.join(', ') + ' <b>measurement data does not exists</b>';
        }
        if (inclusion.length > 0) {
          errorMessages.length > 0 ? errorMessages += ` </br></br> ` : '';
          errorMessages += inclusion.join(', ') + ' <b>inclusion data does not exists</b>';
        }
        if (pWaiting.length > 0) {
          errorMessages.length > 0 ? errorMessages += ` </br></br> ` : '';
          errorMessages += pWaiting.join(', ') + ' <b>In Pwaiting Status</b>';
        }

        this.alertDialogService.show(errorMessages);
      }

      this.gridViewLab = process(this.selectedInventoryItems, { group: this.groups });
      this.cntMnuStones = this.selectedInventoryItems.length.toString();
      let totalWeight = 0.0;
      this.selectedInventoryItems.forEach(z => {
        totalWeight = totalWeight + z.weight;
      });
      this.sumMnuStonesWeight = totalWeight.toFixed(2);
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }
  //#endregion  

  //#region Function
  public checkLabIssueValidation(invItem: InventoryItems): { success: boolean, errorLab: boolean, errorMemo: boolean, errorHold: boolean, errorPReq: boolean, errorPrice: boolean, errorMesu: boolean, errorInc: boolean, errorPWaiting: boolean } {
    let success = false;
    let errorLab = false, errorMemo = false, errorHold = false, errorPReq = false, errorPrice = false, errorMesu = false, errorInc = false;
    let errorPWaiting = false;

    if (this.isRepairProcess)
      success = true;
    else if (invItem.labSendDate != null && (invItem.status && invItem.status == StoneStatus.Lab.toString()))
      errorLab = true;
    else if (invItem.isMemo)
      errorMemo = true;
    else if (invItem.isHold || invItem.isRapnetHold)
      errorHold = true;
    else if (invItem.isPricingRequest)
      errorPReq = true;
    else if (invItem.basePrice.discount == null || invItem.basePrice.discount == 0 ||
      invItem.basePrice.netAmount == null || invItem.basePrice.netAmount == 0 ||
      invItem.basePrice.perCarat == null || invItem.basePrice.perCarat == 0 ||
      invItem.basePrice.rap == null || invItem.basePrice.rap == 0)
      errorPrice = true;
    else if (invItem.measurement.length == null || invItem.measurement.length == 0 ||
      invItem.measurement.width == null || invItem.measurement.width == 0 ||
      invItem.measurement.height == null || invItem.measurement.height == 0 ||
      invItem.measurement.depth == null || invItem.measurement.depth == 0 ||
      invItem.measurement.table == null || invItem.measurement.table == 0)
      errorMesu = true;
    else if (invItem.inclusion.brown == null || invItem.inclusion.green == null || invItem.inclusion.milky == null || invItem.inclusion.shade == null
      || invItem.inclusion.sideBlack == null || invItem.inclusion.centerBlack == null || invItem.inclusion.openCrown == null || invItem.inclusion.openTable == null
      || invItem.inclusion.openPavilion == null || invItem.inclusion.openGirdle == null || invItem.inclusion.girdleCondition == null || invItem.inclusion.efoc == null
      || invItem.inclusion.culet == null || invItem.inclusion.hna == null || invItem.inclusion.efop == null || invItem.inclusion.eyeClean == null
      || invItem.inclusion.naturalOnGirdle == null || invItem.inclusion.naturalOnCrown == null || invItem.inclusion.naturalOnPavillion == null || invItem.inclusion.bowtie == null)
      errorInc = true;
    else if (invItem.status && invItem.status == "P Waiting")
      errorPWaiting = true;
    else
      success = true;

    return { success, errorLab, errorMemo, errorHold, errorPReq, errorPrice, errorMesu, errorInc, errorPWaiting };
  }

  public LabChange() {
    try {
      let Selectedindex = this.labItems.findIndex(x => x.name == this.selectedLabItems?.value);
      if (Selectedindex >= 0) {
        this.labObj = this.labItems[Selectedindex]
        this.labIssueObj.lab.id = this.labObj.id;
        this.labIssueObj.lab.email = this.labObj.email;
        this.labIssueObj.lab.mobileNo = this.labObj.mobileNo;
        this.labIssueObj.lab.name = this.labObj.name;
        this.labIssueObj.lab.phoneNo = this.labObj.phoneNo;
        this.labIssueObj.lab.execFormat = this.labObj.excFormat;
        this.labIssueObj.lab.address = this.labObj.address;
        this.labIssueObj.lab.accountNo = this.labObj.accountNo;
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public LogisticChange() {
    try {
      let Selectedindex = this.logisticItems.findIndex(x => x.name == this.selectedlogisticItems?.value);
      if (Selectedindex >= 0) {
        this.logisticObj = this.logisticItems[Selectedindex]
        this.labIssueObj.logistic.id = this.logisticObj.id;
        this.labIssueObj.logistic.email = this.logisticObj.email;
        this.labIssueObj.logistic.mobileNo = this.logisticObj.mobileNo;
        this.labIssueObj.logistic.name = this.logisticObj.name;
        this.labIssueObj.logistic.phoneNo = this.logisticObj.phoneNo;
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public closeLabIssueDialog(): void {
    this.toggle.emit(false);
  }

  public resetForm(form?: NgForm) {
    this.labObj = new Lab();
    this.selectedInventoryItems = []
    form?.reset();
  }

  public deletePlan(id: string): void {
    try {
      var index = this.selectedInventoryItems.findIndex(x => x.stoneId == id);
      if (index >= 0) {
        this.selectedInventoryItems.splice(index, 1);

        let tempSelectData = [...this.selectedInventoryItems];
        this.gridViewLab = { data: tempSelectData, total: tempSelectData.length };
        this.cntMnuStones = tempSelectData.length.toString();
        let totalWeight = 0.0;
        tempSelectData.forEach(z => {
          totalWeight = totalWeight + z.weight;
        });
        this.sumMnuStonesWeight = totalWeight.toFixed(2);
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async onSavePacket(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        let messageType: string = "";
        let response: CommonResponse = new CommonResponse();
        let flag: boolean = false;
        this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
        this.labIssueObj.labIssueItems = Array<LabIssueItem>();
        this.selectedInventoryItems.forEach(z => {
          let labIssueItems = new LabIssueItem();
          labIssueItems.stoneId = z.stoneId;
          labIssueItems.kapan = z.kapan;
          labIssueItems.shape = z.shape;
          labIssueItems.weight = z.weight;
          labIssueItems.color = z.color;
          labIssueItems.clarity = z.clarity;
          labIssueItems.cut = z.cut;
          labIssueItems.polish = z.polish;
          labIssueItems.symmetry = z.symmetry;
          labIssueItems.fluorescence = z.fluorescence;
          labIssueItems.basePrice.discount = z.basePrice.discount;
          labIssueItems.basePrice.netAmount = z.basePrice.netAmount;
          labIssueItems.basePrice.perCarat = z.basePrice.perCarat;
          labIssueItems.basePrice.rap = z.basePrice.rap;
          labIssueItems.length = z.measurement.length;
          labIssueItems.width = z.measurement.width;
          labIssueItems.height = z.measurement.height;
          if (parseFloat(labIssueItems.weight.toString()) <= 0.99)
            labIssueItems.service = 'DD';
          else
            labIssueItems.service = 'DG';
          this.labIssueObj.labIssueItems.push(labIssueItems);
        })

        this.labIssueObj.identity.id = this.fxCredential.id;
        this.labIssueObj.identity.name = this.fxCredential.fullName;
        this.labIssueObj.identity.type = 'Employee' ?? '';

        messageType = "Inserted";

        var labstonIds = this.labIssueObj.labIssueItems.map(s => s.stoneId);
        if (labstonIds.length > 0) {
          var invData = await this.inventoryService.getInventoryByStoneIds(labstonIds);
          if (invData.length > 0) {
            var stoneIds = invData.filter(c => c.status == "Repair").map(x => x.stoneId)
            if (stoneIds.length > 0)
              await this.commuteService.removePricingRequest(stoneIds);
          }
        }
        let isCheckExistStone = await this.commuteService.getExistsStoneIds(this.labIssueObj.labIssueItems.map(i => i.stoneId));
        if (isCheckExistStone && isCheckExistStone.length > 0) {
          this.alertDialogService.ConfirmYesNo(`Are you sure you want to remove lab issue stone from FO <b>${isCheckExistStone.join(", ")}</b>?`, "Delete")
            .subscribe(async (res: any) => {
              if (res.flag) {
                if (isCheckExistStone.length > 0)
                  flag = await this.commuteService.removeLabIssueInventory(isCheckExistStone);

                response = await this.labService.labIssueRequest(this.labIssueObj);
                if (response && response.isSuccess) {
                  this.loadStock();
                  this.mySelection = [];
                  this.spinnerService.hide();
                  if (action)
                    this.toggle.emit(false);

                  if (this.canDownloadIssueExcel) {
                    this.labIssueObj.id = response.message;
                    this.exportExcelForLab(this.labIssueObj);
                  }

                  this.utilityService.showNotification(`You have been ${messageType} successfully!`);
                  this.resetForm(form);
                }
                else {
                  this.alertDialogService.show(response.message);
                  if (response?.errorMessage?.length > 0)
                    console.error(response.errorMessage);
                }
              }
            })
        }
        else {
          response = await this.labService.labIssueRequest(this.labIssueObj);
          if (response && response.isSuccess) {
            this.loadStock();
            this.mySelection = [];
            this.spinnerService.hide();
            if (action)
              this.toggle.emit(false);

            if (this.canDownloadIssueExcel) {
              this.labIssueObj.id = response.message;
              this.exportExcelForLab(this.labIssueObj);
            }

            this.utilityService.showNotification(`You have been ${messageType} successfully!`);
            this.resetForm(form);
          }
          else {
            this.alertDialogService.show(response.message);
            if (response?.errorMessage?.length > 0)
              console.error(response.errorMessage);
          }
        }
      }
      else {
        this.spinnerService.hide();
        Object.keys(form.controls).forEach((key) => {
          form.controls[key].markAsTouched();
        });
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  //#region Export to excel
  public async exportExcelForLab(labIssue: LabIssue) {
    try {
      if (labIssue != null) {
        this.spinnerService.show();

        let response = await this.labService.downloadExcel(this.fxCredential.organizationId, labIssue);
        if (response) {
          this.spinnerService.hide();
          var downloadURL = window.URL.createObjectURL(response);
          var link = document.createElement('a');
          link.href = downloadURL;
          link.download = `${this.utilityService.exportFileName(this.utilityService.replaceSymbols(labIssue.lab.name))}`;
          link.click();
        }
        else
          this.spinnerService.hide();
      }
    } catch (error: any) {
      this.alertDialogService.show("something went wrong, please try again or contact administrator");
      this.spinnerService.hide();
    }
  }
  //#endregion

  public onAddBarcode() {
    try {
      fromEvent(this.barcodeInput.nativeElement, 'keyup').pipe(
        map((event: any) => {
          return event.target.value;
        })
        , filter(res => res.length > 1)
        , debounceTime(1000)
      ).subscribe((barcodeText: string) => {
        this.addStoneInLabIssueList(barcodeText);
      });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public addStoneInLabIssueList(inputValue: string) {
    if (inputValue !== undefined && inputValue !== null && inputValue !== "") {
      let tempSelectData = [...this.selectedInventoryItems];
      let index = this.inventoryItems.findIndex(x => x.stoneId.toLowerCase() == inputValue?.trim().toString().toLowerCase());
      if (index >= 0) {
        let indexInner = this.selectedInventoryItems.findIndex(x => x.stoneId.toLowerCase() == inputValue?.trim().toString().toLowerCase() && x.labSendDate == null);
        if (indexInner < 0) {
          let validate = this.checkLabIssueValidation(this.inventoryItems[index]);
          if (validate.success) {
            tempSelectData.push(this.inventoryItems[index])
            this.selectedInventoryItems.push(this.inventoryItems[index])
            this.EnteredStoneID = '';
          }
          else {
            if (validate.errorLab)
              this.alertDialogService.show('stone already in lab');
            else if (validate.errorMemo)
              this.alertDialogService.show('stone in memo');
            else if (validate.errorHold)
              this.alertDialogService.show('stone in hold');
            else if (validate.errorPReq)
              this.alertDialogService.show('stone in pricing request');
            else if (validate.errorPrice)
              this.alertDialogService.show('stone pricing does not exists');
            else if (validate.errorMesu)
              this.alertDialogService.show('stone measurement data does not exists');
            else if (validate.errorInc)
              this.alertDialogService.show('stone inclusion data does not exists');
            else if (validate.errorPWaiting)
              this.alertDialogService.show('stone in Pwaiting Status');
            this.EnteredStoneID = '';
            return;
          }
        }
        else {
          this.alertDialogService.show("Stone is already added");
          this.EnteredStoneID = '';
          return;
        }
      }
      else {
        this.alertDialogService.show("stone is not found!");
        this.EnteredStoneID = '';
        return;
      }

      this.gridViewLab = { data: tempSelectData, total: tempSelectData.length };
      this.cntMnuStones = tempSelectData.length.toString();
      let totalWeight = 0.0;
      tempSelectData.forEach(z => {
        totalWeight = totalWeight + z.weight;
      });
      this.sumMnuStonesWeight = totalWeight.toFixed(2);
    }
    this.EnteredStoneID = '';
  }
  //#endregion

  //#region Grid Config
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

  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "LabIssue", "LabIssueGrid", this.gridPropertiesService.getLabIssueGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("LabIssue", "LabIssueGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getLabIssueGrid();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }
  //#endregion
}