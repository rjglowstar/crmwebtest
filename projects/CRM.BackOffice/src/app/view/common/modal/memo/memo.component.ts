import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { WebcamImage } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { GridDetailConfig } from 'shared/businessobjects';
import { FileStore, fxCredential, GridConfig, GridMasterConfig, Notifications, SystemUserPermission } from 'shared/enitites';
import { AppPreloadService, ConfigService, FileStoreService, listCurrencyType, listExportType, NotificationService, StoneStatus, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import * as xlsx from 'xlsx';
import { InvUpdateItem, MemoReceiveInventoryItems, MemoReceiveItems, OrganizationDNorm } from '../../../../businessobjects';
import { BankDNorm, Branch, CurrencyConfig, InventoryItems, InvItem, Ledger, LedgerDNorm, Logistic, Memo, MemoRequest, Organization, TakenBy, TaxType } from '../../../../entities';
import { AccountingconfigService, BoUtilityService, CommuteService, GridPropertiesService, InventoryService, LedgerService, LogisticService, MemorequestService, MemoService, OrderService, OrganizationService, PrintMemoFormat } from '../../../../services';

@Component({
  selector: 'app-memo',
  templateUrl: './memo.component.html',
  styleUrls: ['./memo.component.css']
})

export class MemoComponent implements OnInit {
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  @Output() togglePrint: EventEmitter<string> = new EventEmitter();
  @Input() stockOnHandSelectedItems: InventoryItems[] = [];
  @Input() isVisiable: boolean = false;
  @Input() isViewOnly: boolean = false;
  @Input() isReceive: boolean = false;
  @Input() isEdit: boolean = false;
  @Input() isReadOnly: boolean = false;
  @Input() selectedMemo: Memo = new Memo();
  @Input() memoRequest: MemoRequest = new MemoRequest();
  @Input() public isDisabled: boolean = false;
  @Input() isRepairProcess: boolean = false;
  @Input() public memoRequestList: Array<MemoRequest> = new Array<MemoRequest>();

  public fxCredential!: fxCredential;
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public selectableSettings: SelectableSettings = {
    mode: 'multiple',
    checkboxOnly: true,
  };
  public skeletonArray = new Array(3);
  public mySelection: string[] = [];
  public isGridConfig: boolean = false;
  public totalWeight: number = 0;
  public inventoryItems: InventoryItems[] = [];
  public packetsItems!: InventoryItems[];
  public selectedInventoryItems: InventoryItems[] = [];
  public selectedInvalidInventoryItems: InventoryItems[] = [];
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public cntMnuStones?: string;
  public sumMnuStonesWeight?: string;
  public sumMnuStonesNetAmount?: number;
  public selectedcntMnuStones?: number;
  public selectedsumMnuStonesWeight?: number;
  public selectedsumMnuStonesNetAmount?: number;
  public gridViewInventory!: DataResult;
  public listPartyItems: Array<{ text: string; value: string }> = [];
  public selectedConsign = "";
  public listConsignItem: Array<{ text: string; value: string }> = [];
  public partyItems: LedgerDNorm[] = [];
  public selectedPartyItem: string = "";
  public partyObj: LedgerDNorm = new LedgerDNorm();
  public listBrokerItems: Array<{ text: string; value: string }> = [];
  public brokerItems: LedgerDNorm[] = [];
  public selectedBrokerItem?: { text: string; value: string };
  public brokerObj: LedgerDNorm = new LedgerDNorm();
  public listTakenByItems: Array<{ text: string; value: string }> = [];
  public takenByItems: TakenBy[] = [];
  public selectedTakenByNameItem: string = "";
  public takenByObj: TakenBy = new TakenBy();
  public memoObj = new Memo();
  public memoType: string = "Issue";
  public alredyExistInList: string[] = [];
  public alreadyMemoList: string[] = [];
  public notValidStatusSold: string[] = [];
  public notValidStatusLab: string[] = [];
  public notValidPriceStone: string[] = [];
  public notFoundInList: string[] = [];
  public notIssuedInList: string[] = [];
  public allowCustom = false;
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public isShowCheckBoxAll: boolean = true;
  public isAddTakenByPopup: boolean = false;
  public validTextLengthFlag: boolean = false;
  public photoIdentityErrorFlag: boolean = false;
  public photoIdentityModel: any = undefined;
  public isImgselectedPhotoIdent: boolean = false;
  public currentFile!: File;
  public imagePreviewphoto: any;
  public fileUploadItems: Array<{ type: string, file: File }> = new Array<{ type: string, file: File }>();
  public imageList: FileStore[] = [];
  public imgSrcDisplay: string = "";
  public logisticObj: Logistic = new Logistic();
  public selectedlogisticItems?: { text: string, value: string };
  public listlogisticItems: Array<{ text: string; value: string }> = [];
  public logisticItems: Logistic[] = [];
  public listBankItems: Array<{ text: string; value: string }> = [];
  public bankItems: BankDNorm[] = [];
  public selectedBankItem?: string;
  public bankObj: BankDNorm = new BankDNorm();
  public listTax: Array<{ name: string; isChecked: boolean }> = [];
  public allTheTax: TaxType[] = [];
  public filterTax: string = '';
  public filterTaxChk: boolean = true;
  public taxTypesZ: string[] = [];
  public listCurrencyType: Array<{ text: string; value: string }> = [];
  public listExportType: Array<{ text: string; value: string }> = [];
  public organizationData: Organization = new Organization();
  public organizationDNormItems!: OrganizationDNorm[];
  public isLocalParty: boolean = true;
  public listCurrencyConfig: CurrencyConfig[] = [];
  public message: Notifications = new Notifications();
  public listMemoProcess: string[] = [];
  public canPrintMemo = false;
  public canAboveOneCTPrintMemo = false;
  public partyCompanyName?: string;
  public showWebCam: boolean = false;
  private trigger: Subject<void> = new Subject<void>();
  public listBranchItems: Array<{ text: string; value: string }> = [];
  public branchItems: Branch[] = [];
  public selectedBranchItem?: { text: string; value: string };
  public branchObj: Branch = new Branch();
  public isCanReceiveMemo: boolean = false;
  public stoneIds!: string

  constructor(
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    public appPreloadService: AppPreloadService,
    public router: Router,
    private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService,
    public memoService: MemoService,
    private fileStoreService: FileStoreService,
    private sanitizer: DomSanitizer,
    public ledgerService: LedgerService,
    public logisticService: LogisticService,
    public accountingconfigService: AccountingconfigService,
    private organizationService: OrganizationService,
    private commuteService: CommuteService,
    private boUtilityService: BoUtilityService,
    public inventoryService: InventoryService,
    public memoRequestService: MemorequestService,
    public notificationService: NotificationService,
    private printMemoFormat: PrintMemoFormat,
    private orderService: OrderService) {
  }

  async ngOnInit() {
    await this.loadDefaultMethods();
  }

  public async loadDefaultMethods() {
    try {
      this.spinnerService.show();
      this.fxCredential = await this.appPreloadService.fetchFxCredentials();
      this.organizationData = await this.organizationService.getOrganizationById(this.fxCredential.organizationId);
      await this.getGridConfiguration();
      await this.loadBroker();
      await this.loadBank();
      await this.loadCurrencyConfig();
      await this.getData();
      await this.getBranch();
      await this.setUserRights();

      if (!this.fxCredential)
        this.router.navigate(["login"]);

      if (!this.isViewOnly) {
        this.memoType = "Issue";
        this.isReceive = false;

        if (this.memoRequest.id)
          await this.setMemoDataFromMemoRequest();
        else
          this.memoObj = new Memo();
      }
      else {
        this.spinnerService.hide();

        this.partyObj = new LedgerDNorm();
        this.brokerObj = new LedgerDNorm();
        this.takenByObj = new TakenBy();
        this.selectedInventoryItems = new Array<InventoryItems>();
        if (this.selectedMemo) {
          this.selectedPartyItem = this.selectedMemo.party.name;
          this.partyObj = this.selectedMemo.party;
          if (this.selectedMemo.takenBy)
            this.selectedTakenByNameItem = this.selectedMemo.takenBy;
          if (this.selectedMemo.takenBy != undefined && this.selectedMemo.takenBy != null) {
            let takenByNew: TakenBy[] = await this.memoService.getTakenByName(this.selectedMemo.takenBy);
            if (takenByNew.length > 0) {
              this.takenByObj = takenByNew[0];
              await this.setTakenByImage(this.takenByObj);
            }
          }

          this.selectedBrokerItem = { text: this.selectedMemo.broker.name, value: this.selectedMemo.broker.id };
          this.brokerObj = this.selectedMemo.broker;
          this.memoObj = this.selectedMemo;
          this.selectedInventoryItems = this.selectedMemo.inventoryItems;
          let indexFlag = this.selectedInventoryItems.findIndex(x => x.isHold || x.isMemo);
          this.checkLocalParty(this.partyObj);

          if (indexFlag < 0)
            this.isShowCheckBoxAll = false;
        }
      }

      if (this.isReceive == true) {
        this.memoType = 'ReceiveT';
        await this.memoTypeChange('ReceiveT', true);

      }

      if (this.isEdit == true) {
        this.memoType = 'Edit';
        await this.memoTypeChange('Edit', true);
      }

      if (this.isRepairProcess)
        this.memoObj.process = 'Repair';

      await this.loadStock();
    }
    catch (error: any) {
      console.error(error);
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
      let CanDeleteTransactions = userPermissions.actions.find(z => z.name == "CanReceiveMemo");
      if (CanDeleteTransactions != null)
        this.isCanReceiveMemo = true;
    }
  }

  public fillTax() {
    if (this.allTheTax.length > 0) {
      this.memoObj.taxTypes = this.getSelectedTaxTypeDataFill();
      this.taxTypesZ = this.memoObj.taxTypes?.map(x => x.name);

      if (this.taxTypesZ.length > 0) {
        this.taxTypesZ.forEach(x => {
          if (this.listTax.findIndex(y => y.name == x) >= 0)
            this.listTax[this.listTax.findIndex(y => y.name == x)].isChecked = true;
        });
      }
    }
  }

  public async getData() {
    try {
      this.logisticItems = await this.logisticService.getAllLogistics();
      this.listlogisticItems = [];
      this.logisticItems.forEach(z => { this.listlogisticItems.push({ text: z.name, value: z.name }); });
      this.allTheTax = await this.accountingconfigService.getTaxTypesList();
      this.allTheTax.forEach(z => { this.listTax.push({ name: z.name, isChecked: false }); });
      this.listMemoProcess = await this.accountingconfigService.getMemoProcess();
      Object.values(listCurrencyType).forEach(z => { this.listCurrencyType.push({ text: z.toString(), value: z.toString() }); });
      Object.values(listExportType).forEach(z => { this.listExportType.push({ text: z.toString(), value: z.toString() }); });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#region Grid Load

  public async handlePartyFilter(value: any) {
    try {
      this.partyItems = new Array<LedgerDNorm>();
      let ledgerType: string[] = ['Boiler', 'Photography', 'Lab', 'Customer']
      let parties: Ledger[] = await this.ledgerService.getAllLedgersByType(ledgerType, value);
      for (let index = 0; index < parties.length; index++) {
        const element = parties[index];
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
      this.partyItems.reverse().forEach(z => { this.listPartyItems.push({ text: z.name, value: z.id }); });
      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async partyChange(e: any) {
    if (e) {
      let fetchParty = this.partyItems.find(x => x.id == e);
      if (fetchParty) {
        setTimeout(() => {
          this.selectedPartyItem = fetchParty?.name ?? '';
        }, 0);
        this.partyObj = fetchParty ?? new LedgerDNorm();

        // partycountry same as Orgcountry then Logistic,Portlocation,bank readonly
        // partycountry Diff as Orgcountry then Logistic,Portlocation,bank not readonly
        this.checkLocalParty(fetchParty);
        this.partyCompanyName = this.partyObj.contactPerson;
        this.fillTax();

        //memo issue add. declaration from ledger for Diamart (hk) ltd.
        if (fetchParty?.id && this.fxCredential?.organization == "Diamart (hk) ltd.")
          this.memoObj.additionalDeclaration = await this.ledgerService.getLedgerAddDeclaration(fetchParty?.id);
      }
    }
    else {
      if (this.fxCredential.organization == "Diamart (hk) ltd.")
        this.memoObj.additionalDeclaration = "";
      this.partyObj = new LedgerDNorm();
    }
  }

  public async onConsignChange(e: any) {
    if (e) {
      let fetchParty = this.partyItems.find(x => x.id == e);
      if (fetchParty && fetchParty != undefined) {
        setTimeout(() => {
          this.memoObj.consigneeName = fetchParty?.name ?? '';
        }, 0);
        this.memoObj.consignee = fetchParty;
      }
      else {
        this.memoObj.consignee = new LedgerDNorm();
        this.memoObj.consigneeName = "";
      }
    }
    else {
      this.memoObj.consignee = new LedgerDNorm();
      this.memoObj.consigneeName = "";
    }
  }

  public handleConsignFilter(value: any) {
    this.listConsignItem = [];
    let consignItems = this.partyItems.filter(z => z.name?.toLowerCase().includes(value?.toLowerCase()))
    consignItems.forEach(z => { this.listConsignItem.push({ text: z.name, value: z.id }); });
  }


  public checkLocalParty(fetchParty: LedgerDNorm) {
    if (fetchParty.address.country.toLowerCase() == this.organizationData.address.country.toLowerCase())
      this.isLocalParty = true;
    else
      this.isLocalParty = false;
  }

  public async handleTakenbyFilter(value: any) {
    try {
      if (value) {
        let takenBy: any = await this.memoService.getTakenByName(value);
        if (takenBy && takenBy.length > 0) {
          this.listTakenByItems = [];
          this.takenByItems = takenBy;
          this.takenByItems.reverse().forEach(z => { this.listTakenByItems.push({ text: z.name, value: z.id }); });
        }
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async takenByChange(e: any) {
    if (e) {
      let fetchTakenBy = this.takenByItems.find(x => x.name == e);
      if (fetchTakenBy) {
        setTimeout(() => {
          this.selectedTakenByNameItem = fetchTakenBy?.name ?? '';
        }, 0);
        this.takenByObj = fetchTakenBy;
        await this.setTakenByImage(this.takenByObj);
      }
      else {
        this.takenByObj = new TakenBy();
        this.imageList = [];
        this.clearPreviewFile();
      }
      this.takenByObj.name = e;
    }
    else {
      this.takenByObj = new TakenBy();
      this.imageList = [];
      this.clearPreviewFile();
    }
  }

  public onTakenByKeyPress(event: any) {
    if (event.target.value.length > 0)
      this.validTextLengthFlag = true;
    else
      this.validTextLengthFlag = false;
  }

  private loadImage(imageSrc: string) {
    if (imageSrc != undefined && imageSrc != null && imageSrc != "")
      return 'data:image/JPEG;base64,' + imageSrc;
    else
      return null
  }

  public toggleTakenByDialog() {
    this.isAddTakenByPopup = !this.isAddTakenByPopup;
    if (!this.takenByObj.id)
      this.imageList = []
  }

  public async loadBroker() {
    try {
      let ledgerType: string[] = ['Broker']
      let brokers = await this.ledgerService.getAllLedgersByType(ledgerType);
      for (let index = 0; index < brokers.length; index++) {
        const element = brokers[index];
        this.brokerItems.push({
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
      this.listBrokerItems = [];
      this.brokerItems.forEach(z => { this.listBrokerItems.push({ text: z.name, value: z.id }); });
      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public brokerChange(e: any) {
    if (this.selectedBrokerItem) {
      let fetchBroker = this.brokerItems.find(x => x.name == e.text);
      if (fetchBroker)
        this.brokerObj = fetchBroker;
    }
    else
      this.brokerObj = new LedgerDNorm();
  }

  private async getBranch() {
    try {
      if (this.organizationData.branches)
        this.organizationData.branches.forEach((z) => { this.branchItems.push(z); });

      if (this.branchItems.length > 0) {
        this.listBranchItems = [];
        this.branchItems.forEach((z) => { this.listBranchItems.push({ text: z.name, value: z.name }); });

        //Select Default Branch Match with Organization State.
        let fetchBranch = this.branchItems.find(x => x.address.state.toLowerCase() == this.organizationData.address.state.toLowerCase());
        if (fetchBranch) {
          this.branchObj = fetchBranch;
          this.selectedBranchItem = { text: this.branchObj.name, value: this.branchObj.name };
          this.memoObj.organization.address = this.branchObj.address;
          this.memoObj.organization.email = this.branchObj.email;
          this.memoObj.organization.faxNo = this.branchObj.faxNo;
          this.memoObj.organization.mobileNo = this.branchObj.mobileNo;
          this.memoObj.organization.person = this.branchObj.person;
          this.memoObj.organization.phoneNo = this.branchObj.phoneNo;
          this.memoObj.organization.gstNo = this.branchObj.taxNo;
          this.memoObj.organization.incomeTaxNo = this.branchObj.incomeTaxNo;
          this.memoObj.organization.taxNo = this.branchObj.taxNo;
        }
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public branchChange(e: any) {
    if (this.selectedBranchItem) {
      let fetchBranch = this.branchItems.find(x => x.name == e.text);
      if (fetchBranch)
        this.branchObj = fetchBranch;
    }
    else
      this.branchObj = new Branch();
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

  public async loadCurrencyConfig() {
    try {
      let res = await this.accountingconfigService.getCurrencyConfigsList();
      if (res)
        this.listCurrencyConfig = res;
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public bankChange(e: any) {
    if (this.selectedBankItem) {
      let fetchBank = this.bankItems.find(x => x.bankName == e.text);
      if (fetchBank)
        this.bankObj = fetchBank;
    }
    else
      this.bankObj = new BankDNorm();
  }

  public openDocumentDialog() {
    this.isAddTakenByPopup = true;
  }

  public closeDocumentDialog() {
    this.isAddTakenByPopup = false;
  }

  public sanitizeURL(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public async loadStock() {
    try {
      this.stockOnHandSelectedItems.forEach((element: InventoryItems) => {
        if (this.setPriorityViaMemotype(element)) {
          this.selectedInventoryItems.push(element);
        }
        else
          this.selectedInvalidInventoryItems.push(element);
      });

      if (this.selectedInvalidInventoryItems.length > 0) {
        let invalidMemos = this.selectedInvalidInventoryItems.filter(a => a.isMemo).map(x => x.stoneId).join(', ');
        let invalidSold = this.selectedInvalidInventoryItems.filter(a => (a.status.toLowerCase() == 'sold')).map(x => x.stoneId).join(', ');
        let invalidPrice = this.selectedInvalidInventoryItems.filter(a => ((a.basePrice.netAmount == null || a.basePrice.netAmount == 0))).map(x => x.stoneId).join(', ');

        let message = '';
        if (invalidMemos.length > 0)
          message += `${invalidMemos} <b> In Memo</b>.<br/><br/>`;
        if (invalidSold.length > 0)
          message += `${invalidSold} <b> In Sold status</b>.<br/><br/>`;
        if (invalidPrice.length > 0)
          message += `${invalidPrice} <b> Base Price Invalid</b>.<br/><br/>`;
        if (message)
          this.alertDialogService.show(`${message}<br/>Please check the details.`);
      }

      // sort by boolead isHold and isMemo
      this.selectedInventoryItems.sort(function (x, y) {
        return (!((x.isMemo === y.isMemo) || (x.isHold === y.isHold))) ? 0 : x ? -1 : 1;
      });
      this.boUtilityService.orderByStoneIdInventoryItems(this.selectedInventoryItems);
      this.gridViewInventory = process(this.selectedInventoryItems, {});
      this.cntMnuStones = this.selectedInventoryItems.length.toString();
      let totalWeight = 0.0;
      let totalNetAmount = 0.0;
      this.selectedInventoryItems.forEach(z => {
        totalWeight = totalWeight + z.weight;
        totalNetAmount = totalNetAmount + (z.price.netAmount ?? 0);
      });
      this.sumMnuStonesWeight = totalWeight.toFixed(2);
      this.sumMnuStonesNetAmount = Number(totalNetAmount.toFixed(2));
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error)
    }
  }

  public setPriorityViaMemotype(inventoryItem: InventoryItems) {
    if (this.memoType == "Issue") {
      return (
        !inventoryItem.isMemo
        && inventoryItem.status.toLowerCase() != "sold"
        && ((inventoryItem.basePrice.netAmount != null && inventoryItem.basePrice.netAmount != 0))
      )
    }

    if (this.memoType == "Receive" || this.memoType == "ReceiveT") {
      return (
        inventoryItem.isMemo
        && inventoryItem.status.toLowerCase() != "sold"
        && ((inventoryItem.basePrice.netAmount != null && inventoryItem.basePrice.netAmount != 0))
      )
    }
    return null;
  }

  public async onAddStones() {
    try {
      if (this.stoneIds) {
        if (this.memoType == "Issue") {
          let message: string = ''
          let stones = this.utilityService.CheckStoneIds(this.stoneIds);
          this.alreadyMemoList = [];
          this.notValidStatusSold = [];
          this.notValidStatusLab = [];
          this.notValidPriceStone = [];
          this.alredyExistInList = [];
          this.notFoundInList = [];
          this.notIssuedInList = [];

          if (stones.length > 0) {
            for (let index = 0; index < stones.length; index++) {
              const element = stones[index].toUpperCase();
              await this.addStoneInMemoGridList(element, 0);
            }
          }
          else
            this.notFoundInList.push(this.stoneIds);

          if (this.alreadyMemoList.length > 0)
            message = `${this.alreadyMemoList.toString()}  <b> In Memo</b>.<br/><br/>`;
          if (this.notValidStatusSold.length > 0)
            message = message + ` ${this.notValidStatusSold.toString()} <b> Sold status</b>.<br/><br/>`;
          if (this.notValidPriceStone.length > 0)
            message = message + ` ${this.notValidPriceStone.toString()} <b> Invalid price</b>.<br/><br/>`;
          if (this.alredyExistInList.length > 0)
            message = message + ` ${this.alredyExistInList.toString()} <b> Already exist</b>. <br/><br/>`;
          if (this.notFoundInList.length > 0)
            message = message + ` ${this.notFoundInList.toString()} <b> Not found</b>.`
          if (this.notIssuedInList.length > 0)
            message = `${this.notIssuedInList.toString()} <b> Memo not issued</b>.`
          if (this.notValidStatusLab.length > 0)
            message = message + ` ${this.notValidStatusLab.toString()} <b> In Lab</b>.<br/><br/>`;
          if (message)
            this.alertDialogService.show(message)
        }

        if (this.memoType == 'Receive' || this.memoType == "ReceiveT") {
          this.mySelection = [];
          let stonestext = this.utilityService.CheckStoneIds(this.stoneIds);
          let Items = this.selectedInventoryItems.filter(x => stonestext.findIndex(y => y == x.stoneId) >= 0).map(x => x.stoneId);
          let InvItems = this.selectedInventoryItems.filter(x => stonestext.findIndex(y => y == x.stoneId) >= 0);
          if (Items.length > 0) {
            this.mySelection = Items;
            this.selectedcntMnuStones = InvItems.length;
            let totalWeight = 0.0;
            let totalNetAmount = 0.0;
            InvItems.forEach(z => {
              totalWeight = totalWeight + z.weight;
              totalNetAmount = totalNetAmount + (z.price.netAmount ?? 0);
            });
            this.selectedsumMnuStonesWeight = Number(totalWeight.toFixed(2));
            this.selectedsumMnuStonesNetAmount = Number(totalNetAmount.toFixed(2));
          }
          else {
            this.selectedcntMnuStones = 0;
            this.selectedsumMnuStonesWeight = 0;
            this.selectedsumMnuStonesNetAmount = 0;
          }
        }
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public calculateInvAmount(target: InventoryItems, newDisc: number) {
    if (target?.price?.rap && target?.price?.discount && target?.weight) {
      target.price.discount = newDisc;
      target.price.perCarat = this.utilityService.ConvertToFloatWithDecimal((target.price.rap + (target.price.rap * target.price.discount / 100)));
      target.price.netAmount = this.utilityService.ConvertToFloatWithDecimal(target.price.perCarat * target.weight);
    }
  }

  public async addStoneInMemoGridList(inputValue: string, newDisc: number) {
    let stockList: InventoryItems[] = await this.memoService.getInventoriesByStoneID(inputValue);
    this.inventoryItems = stockList;

    //IF New Discount Comes From Excel then apply that new Discount To Price Dnorm of Inv.
    if (newDisc != 0)
      this.calculateInvAmount(this.inventoryItems[0], newDisc);

    if (inputValue !== undefined && inputValue !== null && inputValue !== "") {
      let tempSelectData = [...this.selectedInventoryItems];
      let index = -1;
      if (this.memoType == "Issue")
        index = this.inventoryItems.findIndex(
          x => x.stoneId.toLowerCase() == inputValue?.trim().toString().toLowerCase()
            && !x.isMemo
            && x.status.toLowerCase() != "sold"
            && (x.basePrice.netAmount != null && x.basePrice.netAmount != 0)
          //&& (x.isLabReturn)// isLabReturn true then OK for Memo Issue.
        );
      else
        index = this.inventoryItems.findIndex(
          x => x.stoneId.toLowerCase() == inputValue?.trim().toString().toLowerCase()
            && x.isMemo
            && x.status.toLowerCase() != "sold"
            && ((x.basePrice.netAmount != null && x.basePrice.netAmount != 0))
        );

      let existErrorStone = this.inventoryItems.find(x => x.stoneId.toLowerCase() == inputValue?.trim().toString().toLowerCase());
      if (index >= 0) {
        let indexInner = this.selectedInventoryItems.findIndex(x => x.stoneId.toLowerCase() == inputValue?.trim().toString().toLowerCase());
        if (indexInner < 0) {
          tempSelectData.push(this.inventoryItems[index])
          this.selectedInventoryItems.push(this.inventoryItems[index])
        }
        else
          this.alredyExistInList.push(this.inventoryItems[index].stoneId);
      }
      else {
        if (existErrorStone) {
          if (this.memoType == "Issue") {
            if (existErrorStone?.isMemo)
              this.alreadyMemoList.push(existErrorStone.stoneId);
            if (existErrorStone?.status.toLowerCase() == "sold")
              this.notValidStatusSold.push(existErrorStone.stoneId);
            if ((existErrorStone.basePrice.netAmount == null || existErrorStone.basePrice.netAmount == 0))
              this.notValidPriceStone.push(existErrorStone.stoneId);
          }
          else {
            if (!existErrorStone?.isMemo)
              this.notIssuedInList.push(existErrorStone.stoneId);
          }
        }
        else
          this.notFoundInList.push(inputValue);
      }

      if (this.memoType == "Receive" || this.memoType == "ReceiveT") {
        if (this.selectedInventoryItems.length > 0)
          this.fields[1].isSelected = true;
      }

      this.gridViewInventory = { data: tempSelectData, total: tempSelectData.length };
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
  //#endregion

  public async onSelectInvFromExcelFile(event: Event) {
    try {
      let acceptedFiles: string[] = []
      const target = event.target as HTMLInputElement;
      if (target.accept) {
        acceptedFiles = target.accept.split(',').map(function (item) {
          return item.trim();
        });
      }

      if (target.files && target.files.length) {
        if (acceptedFiles.indexOf(target.files[0].type) == -1) {
          this.alertDialogService.show(`Please select valid file.`);
          return;
        }

        let file = target.files[0];
        let fileReader = new FileReader();
        this.spinnerService.show();
        fileReader.onload = async (e) => {

          var arrayBuffer: any = fileReader.result;
          let data = new Uint8Array(arrayBuffer);
          let arr = new Array();

          for (let i = 0; i != data.length; ++i)
            arr[i] = String.fromCharCode(data[i]);

          let workbook = xlsx.read(arr.join(""), { type: "binary" });
          let Heading = ["stoneNo", "disc"]
          let inventoryFetchExcelItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: Heading, }) as any;
          let excelDiscStoneItems: Array<{ stoneNo: string, disc: number }> = new Array<{ stoneNo: string, disc: number }>();

          for (let index = 0; index < inventoryFetchExcelItems.length; index++) {
            let element = inventoryFetchExcelItems[index];
            if (element.hasOwnProperty("stoneNo")) {
              if (element.stoneNo)
                element.stoneNo = element?.stoneNo?.toUpperCase();
              excelDiscStoneItems.push(element);
            }
          }

          if (excelDiscStoneItems && excelDiscStoneItems.length > 0) {
            for (let index = 0; index < excelDiscStoneItems.length; index++) {
              const element = excelDiscStoneItems[index];
              await this.addStoneInMemoGridList(element.stoneNo, element.disc);
            }
          }
          this.spinnerService.hide();
        }
        fileReader.readAsArrayBuffer(file);
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  //#region All the function for save and update and delete
  public async onSaveMemo(form: NgForm, action: boolean) {

    if (this.takenByObj == undefined || this.takenByObj == null || this.takenByObj?.id == null) {
      this.alertDialogService.show('Please select valid taken by.');
      return;
    }

    let memoIssueLabStatusInvItems: InventoryItems[] = this.selectedInventoryItems.filter(x => x.status == StoneStatus.Lab.toString());
    if (memoIssueLabStatusInvItems.length > 0 && this.partyObj?.group.toLowerCase() != 'lab') {
      this.alertDialogService.show('Wrong Party Name Selected. Lab status Stone Only Allowed For Lab Group Ledger.');
      return;
    }

    if (memoIssueLabStatusInvItems.length > 0 && memoIssueLabStatusInvItems.length != this.selectedInventoryItems.length) {
      this.alertDialogService.show('Wrong Status Stone Selected. Select All LAB Status Stone OR Select without LAB Status Stones');
      return;
    }

    if (memoIssueLabStatusInvItems.length == 0 && this.partyObj?.group.toLowerCase() == 'lab') {
      this.alertDialogService.show('Lab Group Ledger Only Allowed When Stone In Lab status.');
      return;
    }

    //from inventory memo process is repair 
    if (this.memoObj.process && this.memoObj.process == 'Repair')
      this.isRepairProcess = true;

    this.alertDialogService.ConfirmYesNo(`Do you want to issue a memo for <b>${this.selectedInventoryItems.map(x => x.stoneId).join(", ")}</b>?`, "Memo").subscribe(async (res: any) => {
      if (res.flag) {
        try {
          if (form.valid) {
            this.spinnerService.show();
            let messageType: string = "";
            this.memoObj.party = this.partyObj;
            this.memoObj.broker = this.brokerObj;
            this.memoObj.bank = this.bankObj;
            this.memoObj.takenBy = this.takenByObj.name;
            this.memoObj.inventoryItems = JSON.parse(JSON.stringify(this.selectedInventoryItems));
            this.boUtilityService.orderByStoneIdInventoryItems(this.memoObj.inventoryItems);
            this.memoObj.taxTypes = this.getSelectedTaxTypeData();

            let totalAmount = 0;
            for (let index = 0; index < this.memoObj.inventoryItems.length; index++) {
              const element = this.memoObj.inventoryItems[index];
              if (this.partyObj?.group == null || this.partyObj?.group == undefined || this.partyObj?.group.toLowerCase() == 'customer') {
                element.isHold = true;
                element.holdBy = this.fxCredential.fullName;
              }
              element.isMemo = true;
              element.heldBy = this.partyObj.name;
              element.memoProcess = this.memoObj.process;

              if (this.memoObj.inventoryItems[index].price.netAmount == null || this.memoObj.inventoryItems[index].price.netAmount == 0) {
                this.memoObj.inventoryItems[index].price.discount = this.memoObj.inventoryItems[index].basePrice.discount;
                this.memoObj.inventoryItems[index].price.netAmount = this.memoObj.inventoryItems[index].basePrice.netAmount;
                this.memoObj.inventoryItems[index].price.perCarat = this.memoObj.inventoryItems[index].basePrice.perCarat;
                this.memoObj.inventoryItems[index].price.rap = this.memoObj.inventoryItems[index].basePrice.rap;
              }

              totalAmount += this.memoObj.inventoryItems[index].price.netAmount ?? 0;
            }
            this.memoObj.totalAmount = this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(totalAmount);

            if (this.partyObj?.address.country.toLowerCase() == this.organizationData.address.country.toLowerCase())
              this.memoObj.isOverseas = false
            else
              this.memoObj.isOverseas = true

            this.memoObj.identity.id = this.fxCredential.id;
            this.memoObj.identity.name = this.fxCredential.fullName;
            this.memoObj.identity.type = 'Employee' ?? '';
            if (!this.isEdit)
              this.memoObj.createdBy = this.fxCredential.fullName;

            this.organizationDNormItems = await this.organizationService.getOrganizationDNorm();
            let organizationId = this.fxCredential.organizationId;
            let organization = this.organizationDNormItems.find(z => z.id == organizationId) ?? new OrganizationDNorm();
            this.memoObj.organization = organization;

            if (this.branchObj && this.selectedBranchItem?.text) {
              this.memoObj.organization.address = this.branchObj.address;
              this.memoObj.organization.email = this.branchObj.email;
              this.memoObj.organization.faxNo = this.branchObj.faxNo;
              this.memoObj.organization.mobileNo = this.branchObj.mobileNo;
              this.memoObj.organization.person = this.branchObj.person;
              this.memoObj.organization.phoneNo = this.branchObj.phoneNo;
              this.memoObj.organization.gstNo = this.branchObj.taxNo;
              this.memoObj.organization.incomeTaxNo = this.branchObj.incomeTaxNo;
              this.memoObj.organization.taxNo = this.branchObj.taxNo;
            }

            messageType = "Inserted";
            let responseMemo: string = await this.memoService.insertMemo(this.memoObj, this.isRepairProcess);
            if (responseMemo) {
              let updateResponse: any = this.memoService.updateInventoryListData(this.memoObj.inventoryItems);
              if (updateResponse)
                this.utilityService.showNotification(`You have been ${messageType} successfully!`);


              if (this.partyObj?.group == 'Customer') {
                let req: InvUpdateItem = new InvUpdateItem();

                if (this.partyObj?.address.country.toLowerCase() != this.organizationData.address.country.toLowerCase())
                  req.status = StoneStatus.Transit.toString();
                else
                  req.status = '';

                var stoneIds = this.memoObj.inventoryItems.map(z => z.stoneId);
                req.stoneIds = stoneIds;
                req.memoProcess = this.memoObj.process;

                if (this.memoRequest.id && this.memoRequest.ident) {
                  if (this.memoRequestList && this.memoRequestList.length > 0)
                    req.memoRequestIds = this.memoRequestList.map(x => x.ident);
                }

                let res = await this.commuteService.updateInvItemForMemo(req);
                if (res) {
                  if (this.partyObj.name == "GLOWSTAR SURAT" || this.partyObj.name == "SARJU IMPEX(ST)")
                    res = await this.commuteService.updateInvItemForMemowithLocation(stoneIds, this.partyObj.address.city);

                  if (this.memoRequest.id && this.memoRequest.ident) {
                    req.memoRequestIds = this.memoRequestList.map(x => x.ident);
                    if (this.memoRequestList && this.memoRequestList.length > 0) {
                      let removeMemoReqBackIds = this.memoRequestList.map(x => x.id);
                      let deleteResponse = await this.memoRequestService.deleteMemoRequests(removeMemoReqBackIds);
                      if (deleteResponse) {
                        let response = await this.notificationService.deleteMessagesByParamIds(removeMemoReqBackIds);
                        if (response)
                          this.notificationService.MessageLoadSub();
                        this.memoRequest = new MemoRequest();
                      }
                    }
                  }
                  this.utilityService.showNotification('Issue : Diamanto Inventory data updated!');
                }
                else
                  this.alertDialogService.show('stone(s) not updated in diamanto data, Please try again later!');
              }
              else if (this.partyObj?.group?.toLowerCase() == 'photography') {
                var stoneIds = this.memoObj.inventoryItems.map(z => z.stoneId);
                let res = await this.commuteService.updateInvItemForPhotography(stoneIds);
                if (res)
                  this.utilityService.showNotification('Issue : Diamanto Inventory data updated!');
              }
              if (this.canPrintMemo || this.canAboveOneCTPrintMemo)
                this.memoGet(responseMemo, this.canAboveOneCTPrintMemo);
              if (action)
                this.closeMemoIssueDialog();
            }
            form.reset();
            this.spinnerService.hide();
          }
          else {
            this.spinnerService.hide();
            Object.keys(form.controls).forEach((key) => {
              form.controls[key].markAsTouched();
            });
          }
        }
        catch (error: any) {
          console.error(error);
          this.spinnerService.hide();
          this.alertDialogService.show('Memo not save, Try again later!');
        }
      }
    });
  }

  private getSelectedTaxTypeData(): TaxType[] {
    let taxType: TaxType[] = [];
    this.taxTypesZ.forEach(z => {
      var obj = this.allTheTax.find(a => a.name == z);
      if (obj != null)
        taxType.push(obj);
    });
    return taxType;
  }

  private getSelectedTaxTypeDataFill(): TaxType[] {
    let taxType: TaxType[] = new Array<TaxType>();
    let initTax: TaxType[] = [];
    if (this.partyObj.address.country?.toLowerCase() == 'india' && this.organizationData.address.country?.toLowerCase() == 'india') {
      if (this.partyObj.address.state?.toLowerCase() == this.organizationData.address.state?.toLowerCase())
        initTax = this.allTheTax.filter(a => a.name?.toLowerCase() == 'cgst' || a.name?.toLowerCase() == 'sgst');
      else
        initTax = this.allTheTax.filter(a => a.name?.toLowerCase() == 'igst');
    }

    if (initTax.length > 0)
      taxType = initTax;

    return taxType;
  }

  public async onReceiveMemo(form: NgForm) {

    let receiveAbleInventoryItems: InventoryItems[] = this.selectedInventoryItems.filter(x => this.mySelection.findIndex(y => y == x.stoneId) >= 0);
    let receivedInvItems = JSON.parse(JSON.stringify(receiveAbleInventoryItems));

    let stoneIds = receiveAbleInventoryItems.map(z => z.stoneId);

    if (this.memoType == "Receive") {
      this.alertDialogService.ConfirmYesNo(`Do you want to receive memo of <b>${this.mySelection.join(", ")}</b> as a Stock?`, "Memo").subscribe(async (res: any) => {
        if (res.flag) {
          try {
            if (form.valid) {
              this.spinnerService.show();
              let memoInventoryItems: Array<MemoReceiveInventoryItems> = new Array<MemoReceiveInventoryItems>();

              let orderedStones = await this.orderService.getOrderStonesByStoneIds(stoneIds);

              for (let index = 0; index < receivedInvItems.length; index++) {
                let memoInventoryItem: MemoReceiveInventoryItems = new MemoReceiveInventoryItems();
                const element = receivedInvItems[index];
                element.isHold = ((orderedStones && orderedStones.length > 0) ? ((orderedStones.includes(element.stoneId)) ? true : false) : false)
                element.isMemo = false;
                element.heldBy = this.fxCredential.fullName;
                element.memoProcess = null as any;
                memoInventoryItem.stoneId = element.stoneId;
                memoInventoryItem.invId = element.id;
                memoInventoryItem.isMemo = element.isMemo;
                memoInventoryItem.heldBy = element.heldBy;
                memoInventoryItem.isHold = element.isHold;
                memoInventoryItem.updatedBy = element.updatedBy;
                memoInventoryItem.memoProcess = element.memoProcess;
                memoInventoryItems.push(memoInventoryItem);
              }

              let memorecitem: MemoReceiveItems = new MemoReceiveItems();
              memorecitem.memoId = this.selectedMemo.id;
              memorecitem.memoNo = this.selectedMemo.memoNo;
              memorecitem.inventoryItems = receivedInvItems;

              let response = await this.memoService.getMemoInventoryUpdate(memorecitem)
              if (response) {
                let updateResponse: any = await this.memoService.updateInventoryListMRData(memoInventoryItems);
                if (updateResponse)
                  this.utilityService.showNotification(`You have been received successfully!`);

                let req: InvUpdateItem = new InvUpdateItem();
                req.supplierCode = this.fxCredential.orgCode;

                if (orderedStones.length > 0) {
                  req.stoneIds = orderedStones;
                  req.memoProcess = null as any;

                  if (req.stoneIds && req.stoneIds.length > 0) {
                    let res = await this.commuteService.updateBulkMRInventoryItems(req)
                    if (res) {
                      req.stoneIds = stoneIds.filter(x => !orderedStones.includes(x));
                      if (req.stoneIds && req.stoneIds.length > 0) {
                        res = await this.commuteService.updateBulkMRInventoryItems(req);
                        if (res)
                          this.utilityService.showNotification(`Receive: Inventory Receive as a stock has been successfully!`);
                      }
                      else
                        this.utilityService.showNotification(`Receive: Inventory Receive as a stock has been successfully!`);
                    }
                  }
                }
                else {
                  req.stoneIds = stoneIds;
                  if (req.stoneIds && req.stoneIds.length > 0) {
                    let res = await this.commuteService.updateBulkMRInventoryItems(req)
                    if (res)
                      this.utilityService.showNotification(`Receive: Diamanto Inventory data updated!`);
                  }
                }
                this.closeMemoIssueDialog();
              }
              this.spinnerService.hide();
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
      })
    }
    else if (this.memoType == "ReceiveT") {
      this.alertDialogService.ConfirmYesNo(`Do you want to receive memo of <b>${this.mySelection.join(", ")}</b> as a Transit?`, "Memo").subscribe(async (res: any) => {
        if (res.flag) {
          try {
            if (form.valid) {
              this.spinnerService.show();

              let req: InvUpdateItem = new InvUpdateItem();
              req.supplierCode = this.fxCredential.orgCode;
              req.stoneIds = stoneIds;

              let res = await this.commuteService.updateBulkMRInvSupplierAndLocation(req);
              if (res) {
                this.spinnerService.hide();
                this.closeMemoIssueDialog();
                this.utilityService.showNotification(`Receive: Inventory Receive as a trasit has been successfully!`);
              }


              this.spinnerService.hide();
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
      })
    }
  }

  public async onEditMemo(form: NgForm) {
    try {
      if (form.valid) {
        this.spinnerService.show();

        if (this.takenByObj == undefined || this.takenByObj == null || this.takenByObj?.id == null) {
          this.alertDialogService.show('Please select valid taken by.');
          return;
        }
        //Only Broker & Taken By allow for Edit.
        this.memoObj = new Memo();
        this.memoObj = this.selectedMemo;
        this.memoObj.broker = this.brokerObj;
        this.memoObj.takenBy = this.takenByObj.name;
        this.memoObj.updatedBy = this.fxCredential.id;

        let response = await this.memoService.updateMemo(this.memoObj)
        if (response) {
          this.utilityService.showNotification(`You have been updated successfully!`);
          this.closeMemoIssueDialog();
        }
        this.spinnerService.hide();
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

  public async onSaveTaken(form: NgForm) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        let takenBy: TakenBy = new TakenBy();
        this.takenByObj.name = this.selectedTakenByNameItem;
        takenBy = JSON.parse(JSON.stringify(this.takenByObj));
        let response: TakenBy = await this.memoService.insertTakenBy(takenBy);
        if (response.id) {
          if (this.photoIdentityModel)
            this.uploadFilesOnServer(this.photoIdentityModel, response)

          this.takenByObj = takenBy;
          this.takenByObj.id = response.id;
          this.isAddTakenByPopup = false;
          this.clearPreviewFile();
          this.utilityService.showNotification('Taken by save successfully!');
        }
        else
          this.alertDialogService.show('Taken by not save, Try again later..!');

        this.spinnerService.hide();
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

  public deletePlan(id: string): void {
    try {
      var index = this.selectedInventoryItems.findIndex(x => x.stoneId == id);
      if (index >= 0) {
        this.selectedInventoryItems.splice(index, 1);
        let tempSelectData = [...this.selectedInventoryItems];
        this.boUtilityService.orderByStoneIdInventoryItems(tempSelectData);
        this.gridViewInventory = { data: tempSelectData, total: tempSelectData.length };
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

  public closeMemoIssueDialog(): void {
    this.toggle.emit(false);
  }

  public memoTypeChange(value: string, initSelection: boolean = false) {
    if (value && value != null) {
      if (initSelection)
        this.mySelection = [];
      if (!this.isViewOnly) {
        this.stoneIds = ""
        this.selectedInventoryItems = [];
        this.selectedInvalidInventoryItems = [];
        this.stockOnHandSelectedItems = [];
      }

      if (value.toLowerCase() == "issue") {
        this.fields[0].isSelected = true;
        this.fields[1].isSelected = false;
      }

      if (value.toLowerCase() == "receive" || value.toLowerCase() == "receivet") {
        this.fields[0].isSelected = false;
        this.fields[1].isSelected = true;
      }

      if (value.toLowerCase() == "edit") {
        this.fields[0].isSelected = true;
        this.fields[1].isSelected = false;
      }

      let indexFlag = this.selectedInventoryItems.findIndex(x => x.isHold || x.isMemo);
      if (indexFlag < 0)
        this.fields[1].isSelected = false;

      if (this.isViewOnly)
        this.fields[0].isSelected = false;
    }
  }

  public selectAllInventories(event: string) {
    this.mySelection = [];
    if (this.memoType.toLowerCase() != "issue") {
      if (event.toLowerCase() == 'checked')
        this.mySelection = this.selectedInventoryItems.filter(a => a.isHold || a.isMemo).map(z => z.stoneId);
    }
  }

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
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "MemoIssue", "MemoIssueGrid", this.gridPropertiesService.getMemoIssueGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("MemoIssue", "MemoIssueGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getMemoIssueGrid();
      }

      if (this.isViewOnly && this.memoType == "Issue")
        this.fields[0].isSelected = false;

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  //#endregion
  public uploadFiles(event: Event): void {
    try {
      let acceptedFiles: string[] = [];
      const target = event.target as HTMLInputElement;
      if (target.accept) {
        acceptedFiles = target.accept.split(',').map(function (item) {
          return item.trim();
        });
      }

      if (target.files && target.files.length) {
        if (acceptedFiles.indexOf(target.files[0].type) == -1) {
          this.alertDialogService.show(`Please select valid file.`);
          return;
        }

        let file = target.files[0];
        this.currentFile = file;

        this.photoIdentityModel = this.currentFile;
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewphoto = reader.result;
          if (this.imagePreviewphoto?.toString().includes('application/pdf'))
            this.imagePreviewphoto = 'commonAssets/images/pdf_doc.png';
        };
        reader.readAsDataURL(file);
        this.photoIdentityErrorFlag = false;
        this.isImgselectedPhotoIdent = true;

      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show("Something went wrong in uploadFiles, Try again later");
    }
  }

  public clearPreviewFile() {
    this.imagePreviewphoto = '';
    this.isImgselectedPhotoIdent = false;
    this.photoIdentityModel = undefined;
  }

  public uploadFilesOnServer(file: File, ident: TakenBy, type: string = "TakenBy") {
    this.fileStoreService.postUploadFileDocument(file, type, ident.id, this.memoObj?.memoNo).subscribe(
      async (res: any) => {
        if (res.body?.success) {
          this.utilityService.showNotification(`You have been added TakenBy successfully!`);
          this.takenByObj = new TakenBy();
          this.takenByObj = ident;
          await this.setTakenByImage(this.takenByObj);
          this.isAddTakenByPopup = false;
          this.clearPreviewFile();
        }
      },
      (err: any) => {
        this.currentFile = null as any;
        console.error(err);
        this.alertDialogService.show(`Something went wrong while uploading a file!`, "error")
      }
    );
  }

  public async setTakenByImage(takenBy: TakenBy) {
    this.imageList = await this.fileStoreService.getFileByIdent(takenBy.id);
    if (this.imageList && this.imageList[0]) {
      this.imageList[0].filePath = await this.fileStoreService.getPathToBase64(this.imageList[0].id, this.imageList[0].type);
      this.imageList[0].filePath = this.loadImage(this.imageList[0].filePath) || null as any;
    }
  }

  public LogisticChange() {
    try {
      let Selectedindex = this.logisticItems.findIndex(x => x.name == this.selectedlogisticItems?.value);
      if (Selectedindex >= 0) {
        this.logisticObj = this.logisticItems[Selectedindex]
        this.memoObj.courierName.id = this.logisticObj.id;
        this.memoObj.courierName.email = this.logisticObj.email;
        this.memoObj.courierName.mobileNo = this.logisticObj.mobileNo;
        this.memoObj.courierName.name = this.logisticObj.name;
        this.memoObj.courierName.phoneNo = this.logisticObj.phoneNo;
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public onMultiSelectChange(val: Array<{ name: string; isChecked: boolean }>, selectedData: string[]): void {
    val.forEach(element => {
      element.isChecked = false;
    });

    if (selectedData && selectedData.length > 0) {
      val.forEach(element => {
        selectedData.forEach(item => {
          if (element.name.toLocaleLowerCase() == item.toLocaleLowerCase())
            element.isChecked = true;
        });
      });
    }
  }

  public onOpenDropdown(list: Array<{ name: string; isChecked: boolean }>, e: boolean, selectedData: string[]): boolean {
    if (selectedData.length == 0)
      list.forEach(x => x.isChecked = false);
    if (selectedData?.length == list.map(z => z.name).length)
      e = true;
    else
      e = false;
    return e;
  }

  public handleFilter(e: any): string {
    return e;
  }

  public filterDropdownSearch(allData: TaxType[], e: any, selectedData: string[]): Array<{ name: string; isChecked: boolean }> {
    let filterData: any[] = [];
    allData.forEach(z => { filterData.push({ name: z.name, isChecked: false }); });
    filterData.forEach(z => {
      if (selectedData?.includes(z.name))
        z.isChecked = true;
    });
    if (e?.length > 0)
      return filterData.filter(z => z.name?.toLowerCase().includes(e?.toLowerCase()));
    else
      return filterData;
  }

  public getCommaSapratedString(vals: any[], isAll: boolean = false): string {
    let name = vals.join(',')
    if (!isAll)
      if (name.length > 15)
        name = name.substring(0, 15) + '...';

    return name;
  }

  public currencyChange() {
    let res = this.accountingconfigService.getFromToCurrencyRate(this.memoObj.fromCurrency, this.memoObj.toCurrency, this.listCurrencyConfig);
    this.memoObj.fromCurRate = res.fromRate;
    this.memoObj.toCurRate = res.toRate;
  }

  // #region  MemoRequest From Front Office */
  public async setMemoDataFromMemoRequest() {
    try {
      this.canPrintMemo = true;
      let maininvItems: InventoryItems[] = await this.inventoryService.getInventoryByStoneIds(this.memoRequest.memoStoneIds.map(x => x.stoneId));
      let invItems: InventoryItems[] = this.mappingInventoryItems(this.memoRequest.memoStoneIds, maininvItems);
      this.stockOnHandSelectedItems = invItems;
      this.stockOnHandSelectedItems = this.stockOnHandSelectedItems.filter((v, i, a) => a.findIndex(v2 => (v2.stoneId === v.stoneId)) === i);
      this.fields = this.fields.filter(x => x.propertyName != 'basePrice.rap' && x.propertyName != 'basePrice.discount' && x.propertyName != 'basePrice.netAmount' && x.propertyName != 'basePrice.perCarat')
      this.memoType == "Issue";

      this.partyObj = new LedgerDNorm();
      this.brokerObj = new LedgerDNorm();
      this.selectedPartyItem = this.memoRequest.party.name;
      await this.handlePartyFilter(this.selectedPartyItem);
      this.partyChange(this.memoRequest.party.id);
      this.memoObj.seller = this.memoRequest.seller.name;
      if (this.memoRequest.broker.id) {
        this.selectedBrokerItem = { text: this.memoRequest.broker.name, value: this.memoRequest.broker.id };
        this.brokerObj = this.memoRequest.broker;
      }
      if (this.memoRequest.rate && this.memoRequest.rate > 0) {
        this.memoObj.fromCurrency = listCurrencyType.USD.toString();
        this.memoObj.toCurrency = listCurrencyType.INR.toString();
        this.memoObj.fromCurRate = 1;
        this.memoObj.toCurRate = this.memoRequest.rate;
      }
    } catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show(error.error);
    }
  }

  public mappingInventoryItems(invItems: InvItem[], mainInventory: InventoryItems[]) {
    let inventoryItems = [];
    for (let index = 0; index < invItems.length; index++) {
      const element = invItems[index];
      let boInventory = mainInventory.find(x => x.stoneId.toLowerCase() == element.stoneId.toLowerCase());
      if (boInventory != null) {
        let inventoryItem = new InventoryItems();
        inventoryItem = boInventory ?? new InventoryItems();
        inventoryItem.price.rap = element.price.rap;
        inventoryItem.price.netAmount = element.fAmount ? element.fAmount : (element.netAmount ? element.netAmount : element.price.netAmount);
        inventoryItem.price.discount = element.fDiscount ? element.fDiscount : element.price.discount;
        inventoryItem.price.perCarat = element.perCarat ? element.perCarat : element.price.perCarat;
        inventoryItems.push(inventoryItem);
      }
    }
    return inventoryItems;
  }
  // #endregion */

  //#region Print
  public async memoGet(id: string, isAboveOneCT: boolean = false) {
    try {
      this.spinnerService.show();
      let memoItem = new Memo()
      memoItem = await this.memoService.getById(id);

      if (memoItem && memoItem.inventoryItems.length > 0) {
        this.boUtilityService.orderByStoneIdInventoryItems(memoItem.inventoryItems);
        let printStone: HTMLIFrameElement = document.createElement("iframe");
        printStone.name = "print_detail";
        printStone.style.position = "absolute";
        printStone.style.top = "-1000000px";
        document.body.appendChild(printStone);
        printStone?.contentWindow?.document.open();

        if ((memoItem.organization.address?.country.toLowerCase() == 'india' && !memoItem.isOverseas)
          ||
          (memoItem.organization.address?.country.toLowerCase() == 'belgium' && !memoItem.isOverseas)
        ) {
          printStone?.contentWindow?.document.write(`<html><head>
          <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <link rel="stylesheet" type="text/css" href="commonAssets/css/printmemo.css" media="print" />

            <style>
            .chal-head {
              display: flex;
              justify-content: space-between;
            }

            .co-details {
              position: static;
            }

            .di-info {
              text-align: right;
            }

            .di-info {
              text-align: right;
            }

            .chal-head .logo img {
              width: 250px;
            }

            .di-info span {
              font-size: 12px;
            }

            .chal-body span.c-st,
            .bo-left span {
              font-size: 10px;
            }

            .di-bor-0 td,
            .body-middle th,
            .body-middle td {
              font-size: 10px;
            }

            .body-f-footer {
              font-size: 10px;
              padding: 0px;
            }

            .body-f-footer ul {
              margin: 0;
            }

            .pager {
              font-size: 10px;
              font-weight: 600;
              text-align: right;
              padding-right: 5px;
            }
            .brd-remove table {
              border-collapse: inherit;
          }
          </style>
          </head>`);
        }
        else if ((memoItem.organization.address?.country.toLowerCase() == 'hong kong' || memoItem.organization.address?.country.toLowerCase() == 'united arab emirates') && !memoItem.isOverseas) {
          printStone?.contentWindow?.document.write(`<html><head>
          <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <link rel="stylesheet" type="text/css" href="commonAssets/css/printmemo.css" media="print" />

            <style>
            .chal-head {
              display: flex;
              justify-content: space-between;
            }

            .main-top .bo-left:nth-child(1) {
              flex-basis: 45%;
            }
            .main-top .di-bor-0:nth-child(2) {
              flex-basis: 30%;
            }
            .main-top .di-bor-0:nth-child(3) {
              flex-basis: 30%;
            }

            .co-details {
              position: static;
            }

            .di-info {
              text-align: right;
            }

            .di-info {
              text-align: right;
            }

            .chal-head .logo img {
              width: 250px;
            }

            .di-info span {
              font-size: 12px;
            }

            .chal-body span.c-st,
            .bo-left span {
              font-size: 10px;
            }

            .di-bor-0 td,
            .body-middle th,
            .body-middle td {
              font-size: 10px;
            }

            .body-f-footer {
              font-size: 10px;
              padding: 0px;
            }

            .body-f-footer ul {
              margin: 0;
            }

            .pager {
              font-size: 10px;
              font-weight: 600;
              text-align: right;
              padding-right: 5px;
            }
            .brd-remove table {
              border-collapse: inherit;
          }
          .body-f-footer {
            display: grid;
            grid-template-columns: 1fr 20%;
            }
          </style>
          </head>`);
        }
        else if (
          (
            memoItem.organization.address?.country.toLowerCase() == 'hong kong'
            ||
            memoItem.organization.address?.country.toLowerCase() == 'united arab emirates'
          )
          && memoItem.isOverseas) {
          printStone?.contentWindow?.document.write(`<html><head>
          <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <link rel="stylesheet" type="text/css" href="commonAssets/css/printmemo.css" media="print" />

          <style>
          .chal-head {
              display: flex;
              justify-content: space-between;
            }

              .body-f-mid table {
                  width: 100%;
              }
          </style>
          </head>`);
        }
        else {
          printStone?.contentWindow?.document.write(`<html><head>
          <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <link rel="stylesheet" type="text/css" href="commonAssets/css/printmemo.css" media="print" />
          </head>`);
        }

        let printContents: string;
        if (isAboveOneCT)
          printContents = await this.printMemoFormat.getAbovePointFiveCentMemoPrint(memoItem);
        else
          printContents = await this.printMemoFormat.getMemoPrint(memoItem);

        printStone?.contentWindow?.document.write(printContents);
        printStone?.contentWindow?.document.close();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region Web Cam Support
  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public handleImage(webcamImage: WebcamImage): void {
    let imageName = this.utilityService.exportFileName('Webcam_Image');
    const base64 = webcamImage.imageAsBase64;
    const imageFullName = imageName + '.jpeg';
    const imageBlob = this.dataURItoBlob(base64);
    const imageFile = new File([imageBlob], imageFullName, { type: 'image/jpeg' });
    this.currentFile = imageFile;
    this.photoIdentityModel = this.currentFile;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewphoto = reader.result;
    };
    reader.readAsDataURL(imageFile);
    this.photoIdentityErrorFlag = false;
    this.isImgselectedPhotoIdent = true;
    this.showWebCam = false;
  }

  dataURItoBlob(dataURI: any) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    return blob;
  }

  public selectedRowChange(event: any) {
    if (this.mySelection != null && this.mySelection.length > 0) {
      let stonestext = this.mySelection;
      let Items = this.selectedInventoryItems.filter(x => stonestext.findIndex(y => y == x.stoneId) >= 0).map(x => x.stoneId);
      let InvItems = this.selectedInventoryItems.filter(x => stonestext.findIndex(y => y == x.stoneId) >= 0);
      if (Items.length > 0) {
        this.mySelection = Items;
        this.selectedcntMnuStones = InvItems.length;
        let totalWeight = 0.0;
        let totalNetAmount = 0.0;
        InvItems.forEach(z => {
          totalWeight = totalWeight + z.weight;
          totalNetAmount = totalNetAmount + (z.price.netAmount ?? 0);
        });
        this.selectedsumMnuStonesWeight = Number(totalWeight.toFixed(2));
        this.selectedsumMnuStonesNetAmount = Number(totalNetAmount.toFixed(2));
      }
      else {
        this.selectedcntMnuStones = 0;
        this.selectedsumMnuStonesWeight = 0;
        this.selectedsumMnuStonesNetAmount = 0;
      }
    }

    if (this.mySelection.length == 0) {
      this.selectedcntMnuStones = 0;
      this.selectedsumMnuStonesWeight = 0;
      this.selectedsumMnuStonesNetAmount = 0;
    }
  }
  //#endregion
}