import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, SystemUserPermission } from 'shared/enitites';
import { ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { ExportRequestCriteria, InvUpdateItem, InvUpdateItemResponse, MemoReturnInwardNo, MemoReturnSearchCriteria } from '../../businessobjects';
import { BankDNorm, IdentityDNorm, InventoryItems, InWardMemo, LedgerDNorm, MemoInvItem, MemoInvReturnItem, Memoreturn, Organization, PriceDNorm } from '../../entities';
import { GridPropertiesService, LedgerService, OrganizationService, MemoReturnService, PrintMemoReturnFormat, CommuteService, InventoryService, InwardMemoService, ExportRequestService, OrderService } from '../../services';

@Component({
  selector: 'app-memoreturn',
  templateUrl: './memoreturn.component.html',
  styleUrls: ['./memoreturn.component.css']
})

export class MemoreturnComponent implements OnInit {
  @ViewChild('BarcodeInput') barcodeInput!: ElementRef;

  public fxCredentials!: fxCredential;
  public organization: Organization = new Organization();

  //# region grid Data
  public selectableSettings: SelectableSettings = { mode: 'single' };
  public groups: GroupDescriptor[] = [];
  public mySelection: string[] = [];
  public gridView!: DataResult;
  public pageSize = 26;
  public skip = 0
  public fields!: GridDetailConfig[];
  public gridMasterConfigResponse!: GridMasterConfig;
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;

  //# region search filter
  public memoReturnSearchCriteria: MemoReturnSearchCriteria = new MemoReturnSearchCriteria();
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public certificateNo?: string;
  public stoneId: string = "";

  //# region modal 
  public memoReturnItems: Memoreturn[] = [];
  public memoReturnObj: Memoreturn = new Memoreturn();
  public memoInvItems: MemoInvItem[] = [];
  public memoInvReturnItems: MemoInvReturnItem[] = [];
  public isInwardmemo: boolean = false
  public inWardMemoFromMemoNo: InWardMemo = new InWardMemo();
  public listPartyItems: Array<{ text: string; value: string }> = [];
  public partyItems: LedgerDNorm[] = [];
  public selectedParty = "";
  public selectedPartyLedger: LedgerDNorm = new LedgerDNorm();
  public selectedInwardNo = "";
  public selectedDeclaration = "";
  public selectedCIFCity = "";
  public listBankItems: Array<{ text: string; value: string }> = [];
  public bankItems: BankDNorm[] = [];
  public bankObj: BankDNorm = new BankDNorm();
  public selectedBankItem?: string;
  public printMemoReturnObj: Memoreturn = new Memoreturn();
  public selectedMemoReturnObj: Memoreturn = new Memoreturn();
  public isCanDeleteMemoReturn: boolean = false;
  public cntMnuStones?: string;
  public sumMnuStonesWeight?: string;
  public sumMnuStonesNetAmount?: number;
  public stoneIds!: string
  public filterFlag = true;

  constructor(
    private router: Router,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private utilityService: UtilityService,
    private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService,
    private ledgerService: LedgerService,
    private memoReturnService: MemoReturnService,
    private organizationService: OrganizationService,
    public printMemoReturnFormat: PrintMemoReturnFormat,
    public commuteService: CommuteService,
    public inventoryService: InventoryService,
    public inwardMemoService: InwardMemoService,
    public exportRequestService: ExportRequestService,
    private orderService: OrderService,
  ) { }

  public async ngOnInit() {
    this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    try {
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      if (!this.fxCredentials)
        this.router.navigate(["login"]);

      this.spinnerService.show();
      await this.getGridConfiguration();
      await this.loadParty();
      await this.loadOrganizationData();
      await this.initData();
      await this.loadBank();
      await this.setUserRights();

      this.utilityService.filterToggleSubject.subscribe(flag => {
        this.filterFlag = flag;
      });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Data not load!');
    }
  }


  //#region default method 
  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "MemoReturn", "MemoReturnGrid", this.gridPropertiesService.getInWardItems());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("MemoReturn", "MemoReturnGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getMemoReturnItems();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async loadParty() {
    try {
      let ledgerType: string[] = ['Customer', 'Suppliers']
      let partys = await this.ledgerService.getAllLedgersByType(ledgerType);
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

  public async loadOrganizationData() {
    try {
      this.organization = await this.organizationService.getOrganizationById(this.fxCredentials.organizationId);
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Organization not load, Try gain later!');
    }
  }

  public async initData() {
    try {
      this.spinnerService.show();
      this.memoReturnSearchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      this.memoReturnSearchCriteria.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];

      let res = await this.memoReturnService.getPaginatedByCriteria(this.memoReturnSearchCriteria, this.skip, this.pageSize);
      if (res) {
        this.memoReturnItems = res.memoReturns;
        this.gridView = process(res.memoReturns, { group: this.groups });
        this.gridView.total = res.totalCount;
        this.mySelection = [];
        this.memoReturnObj = new Memoreturn();
        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Data not load, Try gain later!');
    }
  }

  public async loadBank() {
    try {
      let banks = await this.ledgerService.getBankAccounts();
      for (let index = 0; index < banks.length; index++) {
        const element = banks[index];
        this.bankItems.push(element);
      }
      this.listBankItems = [];
      this.bankItems.forEach(z => { this.listBankItems.push({ text: z.bankName, value: z.bankName }); });
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async setUserRights() {
    let userPermissions: SystemUserPermission = new SystemUserPermission();
    let sesValue = sessionStorage.getItem("userPermission");
    if (sesValue)
      userPermissions = JSON.parse(sesValue) as SystemUserPermission;
    if (userPermissions.actions.length > 0) {
      let CanDeleteTransactions = userPermissions.actions.find(z => z.name == "CanDeleteMemoReturn");
      if (CanDeleteTransactions != null)
        this.isCanDeleteMemoReturn = true;
    }
  }

  //#endregion

  //#region grid methods
  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.initData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.initData();
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public setNewGridConfig(gridConfig: GridConfig) {
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

  public async deleteMemoReturn() {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to Delete Memo Return", "Delete")
      .subscribe(async (res: any) => {
        if (res.flag && this.selectedMemoReturnObj) {
          try {
            this.spinnerService.show();
            let res = await this.memoReturnService.delete(this.selectedMemoReturnObj.id);
            if (res) {
              this.utilityService.showNotification('Memo return remove successfully!');
              this.mySelection = [];
              this.selectedMemoReturnObj = new Memoreturn();
              this.initData();
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show('Memo return not remove, Try again later!');
            }
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Memo return not remove, Try again later!');
          }
        }
      });
  }

  public async openmemoDialog() {
    this.isInwardmemo = true;
    this.onAddStones();
  }

  //#endregion

  //#region filter methods 
  public clearFilter() {
    this.memoReturnSearchCriteria = new MemoReturnSearchCriteria();
    this.stoneId = "";
    this.certificateNo = "";
    this.memoReturnSearchCriteria.partyId = null as any;
    this.initData();
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  //#endregion

  //#region modal method
  public handlePartyFilter(value: any) {
    this.listPartyItems = [];
    let partyItems = this.partyItems.filter(z => z.name.toLowerCase().includes(value.toLowerCase()))
    partyItems.forEach(z => { this.listPartyItems.push({ text: z.name, value: z.id }); });
  }

  public closeInwardmemoDialog(): void {
    this.memoReturnObj = new Memoreturn();
    this.mySelection = [];
    this.isInwardmemo = false;
    this.inWardMemoFromMemoNo = new InWardMemo();
    this.memoInvReturnItems = [];
    this.cntMnuStones = '0';
    this.sumMnuStonesWeight = '0';
    this.sumMnuStonesNetAmount = 0;
    this.selectedParty = '';
    this.onClearStones();
  }

  public async returnInwardMemo() {
    let stoneIds = this.memoInvReturnItems.map(z => z.stoneId);

    // First, checking if stones are in memo from BO
    let boStoneIds = await this.inventoryService.getIsMemoStone(stoneIds);
    if (boStoneIds && boStoneIds.length > 0) {
      this.spinnerService.hide();
      this.alertDialogService.show(`Stone(s) <b>${boStoneIds.join(", ")}</b> are in memo. Please add valid stones!`);
      return;
    }

    // Checking if inventory is found
    let inv = await this.inventoryService.getInventoryByStoneIds(stoneIds);
    if (inv && inv.length > 0) {
      let lockedOrders: string[] = [];
      let OrderStoneIds = inv.filter(res => res?.status === "Order").map(invRes => invRes?.stoneId);

      // Checking if any orders are locked
      if (OrderStoneIds && OrderStoneIds.length > 0)
        lockedOrders = await this.orderService.checkOrderIsLocked(OrderStoneIds);

      if (lockedOrders && lockedOrders.length > 0) {
        this.spinnerService.hide();
        this.alertDialogService.show(`Stone(s) <b>${lockedOrders.join(", ")}</b> have customer orders. Please remove those stones!`);
        return;
      }
    }
    else {
      this.spinnerService.hide();
      this.alertDialogService.show('Stone(s) not found. Please contact the administrator.');
      return;
    }

    // Validating export request stone to proceed
    if (stoneIds && stoneIds.length > 0) {
      let criteria = new ExportRequestCriteria();
      criteria.stoneIds = stoneIds;
      criteria.location.push(this.utilityService.getLocationFromExportRequest(this.inWardMemoFromMemoNo.party.address.country));
      let notValidExpoReqStone = await this.exportRequestService.notValidExpoRequestForRInwardMemo(criteria);
      let msg = notValidExpoReqStone.length > 0 ? `Exist Export request is not valid with selected party` : "";

      this.alertDialogService.ConfirmYesNo(`Are you sure you want to return this/these stone(s) ${notValidExpoReqStone.length > 0 ? "<b>" + notValidExpoReqStone.join(',') + " " + msg + "</b>" : ""}`, "Return")
        .subscribe(async (res: any) => {
          if (res.flag) {
            try {
              if (inv && inv.length > 0) {
                let inwMemoReturnData = inv.filter(res => res?.status != "Sold");
                if (inwMemoReturnData && inwMemoReturnData.length > 0) {
                  let isHold = inwMemoReturnData.some(res => res?.isHold == true);
                  if (isHold) {
                    this.alertDialogService.ConfirmYesNo(`Are you sure you want to return <b>${inwMemoReturnData.filter(x => x.isHold == true).map(x => x.stoneId).join(", ")}</b> Hold stones?`, "Warning")
                      .subscribe(async (res: any) => {
                        if (res.flag)
                          await this.processInventoryUpdate(inwMemoReturnData);
                        else {
                          this.alertDialogService.show('Please remove the Hold stones first.');
                          this.spinnerService.hide();
                        }
                      });
                  }
                  else
                    await this.processInventoryUpdate(inwMemoReturnData);

                }
                else {
                  this.spinnerService.hide();
                  this.alertDialogService.show('The stone is either "sold" or not found in inwardMemo return stone(s).');
                }
              }
              else {
                this.spinnerService.hide();
                this.alertDialogService.show('Stone(s) not found. Please contact administrator!');
              }
            }
            catch (error: any) {
              console.error(error);
              this.alertDialogService.show('Stone(s) not updated. Please try again later!');
              this.spinnerService.hide();
            }
          }
        });
    }
  }

  public async processInventoryUpdate(data: InventoryItems[]) {
    this.spinnerService.show();
    //Update Fo inventoryItem
    let result = await this.updateDiamantoInvItem(data);
    if (result && result.length > 0) {
      //Delete Bo inventory and update inwardMemo stone
      await this.removeInventoryItemsData(result);
      this.utilityService.showNotification('Diamanto Inventory removed successfully!');
    }
    else
      this.alertDialogService.show('Frontoffice update fail, Try again later!');
    this.spinnerService.hide();
  }

  public async updateDiamantoInvItem(inv: InventoryItems[]): Promise<string[]> {
    try {
      let allStoneIds: string[] = [];
      let hardDeleteStoneIds = inv.filter(z => z.inWardFlag?.toLowerCase() == 'p').map(z => z.stoneId);
      let updateStoneIds = inv.filter(z => z.inWardFlag?.toLowerCase() == 'f').map(z => z.stoneId);

      if (updateStoneIds.length > 0) {
        //Update Stone Data (already exists in another Back Office)
        var result = await this.updateDiamantoInventoryItem(updateStoneIds);
        if (result)
          allStoneIds.push(...result.successStoneIds, ...result.holdStoneIds);
      }

      if (hardDeleteStoneIds.length > 0) {
        //Hard Delete Data
        let result = await this.hardRemoveDiamantoInventoryItem(hardDeleteStoneIds);
        if (result)
          allStoneIds.push(...result.successStoneIds, ...result.holdStoneIds);
      }

      return allStoneIds;
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('stone(s) not remove, Please try again later!');
      return [];
    }
  }

  public async hardRemoveDiamantoInventoryItem(stoneIds: string[]): Promise<InvUpdateItemResponse> {
    try {
      let req: InvUpdateItem = new InvUpdateItem();
      req.isRemove = true;
      req.stoneIds = stoneIds;
      let res = await this.commuteService.removeBulkInventoryItems(req)
      if (res)
        return (res);
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('stone(s) not remove in diamanto data, Please try again later!');
      }
      return null as any;
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('stone(s) not remove, Please try again later!');
      return null as any;
    }
  }

  public async updateDiamantoInventoryItem(stoneIds: string[]): Promise<InvUpdateItemResponse> {
    try {
      let req: InvUpdateItem = new InvUpdateItem();
      req.isRemove = false;
      req.stoneIds = stoneIds;
      let res = await this.commuteService.removeBulkInventoryItems(req)
      if (res)
        return (res);
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('stone(s) not updated in diamanto data, Please try again later!');
      }
      return null as any;
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('stone(s) not updated in diamanto data, Please try again later!');
      return null as any;
    }
  }

  public async removeInventoryItemsData(stoneIds: string[]) {
    try {
      if (stoneIds.length > 0) {
        var res = await this.inventoryService.deleteInventoriesData(stoneIds);
        if (res) {
          this.utilityService.showNotification('Inventory removed successfully!');
          await this.updateInwardMemo(stoneIds);
        }
        else {
          this.spinnerService.hide();
          this.alertDialogService.show('stone(s) not remove, Please try again later!');
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('stone(s) not remove, Please try again later!');
    }
  }

  public async updateInwardMemo(stoneIds: string[]) {
    try {
      if (stoneIds.length > 0) {

        var res = await this.inwardMemoService.updateForReturnStones(stoneIds);
        if (res) {
          this.utilityService.showNotification('Inward memo updated successfully!');

          await this.exportRequestService.deleteExportRequestByStoneIds(stoneIds);
          this.InsertMemoReturn();
        }
        else {
          this.spinnerService.hide();
          this.alertDialogService.show('Inward memo not updated, Please try again later!');
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Inward memo not updated, Please try again later!');
    }
  }

  public async InsertMemoReturn() {
    try {
      if (this.memoInvReturnItems && this.memoInvReturnItems.length > 0) {
        let employee: IdentityDNorm = new IdentityDNorm();
        employee.name = this.fxCredentials.fullName;
        employee.id = this.fxCredentials.id;
        employee.type = 'Employee';
        this.memoReturnObj.employee = employee;
        this.memoReturnObj.createdBy = this.fxCredentials.fullName;
        this.memoReturnObj.createdById = this.fxCredentials.id;
        this.memoReturnObj.cifCityName = this.selectedCIFCity;
        this.memoReturnObj.organization = this.organization;
        this.memoReturnObj.bank = this.bankObj;
        this.memoReturnObj.party = this.selectedPartyLedger;
        this.memoReturnObj.returnInvItems = this.memoInvReturnItems;
        this.memoReturnObj.totalPcs = this.memoInvReturnItems.length;
        this.memoReturnObj.totalWeight = this.utilityService.ConvertToFloatWithDecimal(this.memoInvReturnItems.map(z => parseFloat(z.weight.toString())).reduce((ty, u) => ty + u, 0));
        this.memoReturnObj.totalAmount = this.utilityService.ConvertToFloatWithDecimal(this.memoInvReturnItems.map(z => z.price.netAmount ?? 0).reduce((ty, u) => ty + u, 0));
        let res = await this.memoReturnService.insert(this.memoReturnObj);
        if (res) {
          this.utilityService.showNotification('Memo return request submitted!');
          this.spinnerService.hide();
          this.closeInwardmemoDialog();
          this.initData();
        }
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show('Memo return request not inserted, Please try again later!');
      console.error(error);
    }
  }

  public mappingInWardInvData(inventoryItems: MemoInvItem[]): MemoInvReturnItem[] {
    let memoIns: MemoInvReturnItem[] = [];
    var validData = inventoryItems;
    validData.forEach(z => {
      let obj: MemoInvReturnItem = new MemoInvReturnItem();
      obj.invId = z.invId;
      obj.stoneId = z.stoneId;
      obj.kapan = z.kapan;
      obj.shape = z.shape;
      obj.weight = z.weight;
      obj.color = z.color;
      obj.clarity = z.clarity;
      obj.cut = z.cut;
      obj.polish = z.polish;
      obj.symmetry = z.symmetry;
      obj.fluorescence = z.fluorescence;
      obj.length = z.length ?? null as any;
      obj.width = z.width ?? null as any;
      obj.height = z.height ?? null as any;
      obj.lab = z.lab;
      obj.certificateNo = z.certificateNo;
      let price: PriceDNorm = new PriceDNorm();
      price.rap = z.price.rap ?? null;
      price.discount = z.price.discount ?? null;
      price.netAmount = z.price.netAmount ?? null;
      price.perCarat = z.price.perCarat ?? null;
      obj.price = price;
      obj.inwardMemoNo = this.inWardMemoFromMemoNo.memoNo;
      obj.inwardMemoDate = this.inWardMemoFromMemoNo.createdDate;
      obj.declaration = this.selectedDeclaration;
      obj.srNo = z.srNo;
      memoIns.push(obj);
    });
    return memoIns;
  }

  public onClearStones() {
    try {
      this.stoneIds = "";
      this.selectedDeclaration = "";
      this.selectedBankItem = "";
      this.selectedCIFCity = "";
      this.selectedInwardNo = "";
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async onAddStones() {
    try {
      if (this.stoneIds && this.stoneIds.length > 0) {
        this.spinnerService.show();
        let message: string = ''
        let stoneIds = this.utilityService.CheckStoneIds(this.stoneIds.trim().toLowerCase());
        let inwardNoobj: MemoReturnInwardNo = new MemoReturnInwardNo();
        inwardNoobj.inwardNo = this.selectedInwardNo;

        let alreadyExistsStoneIds = this.memoInvReturnItems.filter(z => stoneIds.includes(z.stoneId.toLowerCase())).map(z => z.stoneId.toLowerCase());
        if (alreadyExistsStoneIds.length > 0) {
          this.alertDialogService.show(alreadyExistsStoneIds.join(',') + ' stone(s) already exists in list!', 'warning');
          stoneIds = stoneIds.filter(z => !alreadyExistsStoneIds.includes(z));
        }

        this.inWardMemoFromMemoNo = await this.memoReturnService.getInwardMemoFromMemoNo(inwardNoobj);
        if (this.inWardMemoFromMemoNo) {
          let searchStones = this.inWardMemoFromMemoNo.inventoryItems.filter(z => stoneIds.includes(z.stoneId.toLowerCase()));
          if (searchStones && searchStones.length > 0) {
            if (this.selectedParty == "" || this.selectedParty == this.inWardMemoFromMemoNo.party.name) {

              //Check in Old memo stone already return, when stone re-return in inv
              var OldMemoReturnedStoneIds = this.inWardMemoFromMemoNo.inventoryItems.filter(item => item.isReturned && stoneIds.includes(item.stoneId.toLocaleLowerCase())).map(item => item.stoneId);
              if (OldMemoReturnedStoneIds && OldMemoReturnedStoneIds.length > 0) {
                this.alertDialogService.show(OldMemoReturnedStoneIds.join(',') + " Stone(s) have already returned from this memo.");
                searchStones = searchStones.filter(z => !OldMemoReturnedStoneIds.includes(z.stoneId));
              }

              //Check in Front office if stone is in Hold,Memo
              var foStoneIds = await this.commuteService.checkMemoStones(stoneIds);
              if (foStoneIds && foStoneIds.length > 0) {
                this.alertDialogService.show(foStoneIds.join(',') + " Stone(s) is in memo in frontOffice!");
                searchStones = searchStones.filter(z => !foStoneIds.includes(z.stoneId));
              }

              if (searchStones.length > 0) {
                let Items = this.mappingInWardInvData(searchStones);
                Items.forEach(z => { this.memoInvReturnItems.push(z) });

                this.cntMnuStones = this.memoInvReturnItems.length.toString();
                let totalWeight = 0.0;
                let totalNetAmount = 0.0;
                this.memoInvReturnItems.forEach(z => {
                  totalWeight = totalWeight + z.weight;
                  totalNetAmount = totalNetAmount + (z.price.netAmount ?? 0);
                });
                this.sumMnuStonesWeight = totalWeight.toFixed(2);
                this.sumMnuStonesNetAmount = Number(totalNetAmount.toFixed(2));

                this.selectedParty = this.inWardMemoFromMemoNo.party.name;
                this.selectedPartyLedger = this.inWardMemoFromMemoNo.party;
              }
            }
            else
              this.alertDialogService.show('Same Party Required');
          }
        }
        if (message)
          this.alertDialogService.show(message)

        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public bankChange(e: any) {
    let fetchBank = this.bankItems.find(x => x.bankName?.toLowerCase() == e?.toLowerCase());
    if (fetchBank) {
      this.bankObj = fetchBank;
    }
    else
      this.bankObj = new BankDNorm();
  }

  public async transactionPrint(id: string) {
    try {
      this.spinnerService.show();
      this.printMemoReturnObj = await this.memoReturnService.getMemoReturnFromMemoNo(id);

      let printStone: HTMLIFrameElement = document.createElement("iframe");
      printStone.name = "print_detail";
      printStone.style.position = "absolute";
      printStone.style.top = "-1000000px";
      document.body.appendChild(printStone);
      printStone?.contentWindow?.document.open();

      var headHtml = `<html><head>
      <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <link rel="stylesheet" type="text/css" href="commonAssets/css/printinvoice.css" media="print" />

      <style>
      .chal-head {
          display: flex;
          justify-content: space-between;
        }
          .body-f-mid table {
              width: 100%;
          }
      </style>
      </head>`;

      if (this.printMemoReturnObj.organization.name == "CHINTAN GEMS BV") {
        headHtml = `<html><head>
        <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <link rel="stylesheet" type="text/css" href="commonAssets/css/printCGinvoice.css" media="print" />
        </head>`;
      }

      printStone?.contentWindow?.document.write(headHtml);

      let printContents: string;

      if (!this.inWardMemoFromMemoNo || !this.inWardMemoFromMemoNo.id) {
        let inwardNoobj: MemoReturnInwardNo = new MemoReturnInwardNo();
        inwardNoobj.inwardNo = this.printMemoReturnObj.returnInvItems[0].inwardMemoNo;
        this.inWardMemoFromMemoNo = await this.memoReturnService.getInwardMemoFromMemoNo(inwardNoobj);
      }

      printContents = this.printMemoReturnFormat.getMemoReturnInvoice(this.printMemoReturnObj, this.inWardMemoFromMemoNo.inventoryItems);
      printStone?.contentWindow?.document.write(printContents);
      printStone?.contentWindow?.document.close();
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public onSelect(event: any): void {
    try {
      this.selectedMemoReturnObj = new Memoreturn();
      if (event.selectedRows.length)
        this.selectedMemoReturnObj = JSON.parse(JSON.stringify(event.selectedRows[0].dataItem));
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Data not selected');
    }
  }

  public deleteStone(stoneId: string) {
    try {
      var index = this.memoInvReturnItems.findIndex(x => x.stoneId == stoneId);
      if (index >= 0) {
        this.memoInvReturnItems.splice(index, 1);
        let tempSelectData = [...this.memoInvReturnItems];

        this.cntMnuStones = tempSelectData.length.toString();
        let totalWeight = 0.0;
        let totalNetAmount = 0.0;
        tempSelectData.forEach(z => {
          totalWeight = totalWeight + z.weight;
          totalNetAmount = totalNetAmount + (z.price.netAmount ?? 0);
        });
        this.sumMnuStonesWeight = totalWeight.toFixed(2);
        this.sumMnuStonesNetAmount = Number(totalNetAmount.toFixed(2));
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  //#endregion
}