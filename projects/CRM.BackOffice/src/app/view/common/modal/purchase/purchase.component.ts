import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AccountingconfigService, CommuteService, InventoryService, InventoryUploadService, InwardMemoService, LabService, LedgerService, MasterConfigService, OrderService, OrganizationService, TransactionService, TransactItemService } from '../../../../services';
import { listCurrencyType, MeasureGradeService, PricingService, StoneStatus, TransactionType, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { fxCredential, MasterConfig, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { InventoryExcelItems, InverntoryError, InvUpdateItem } from '../../../../businessobjects';
import { Address, GirdleDNorm, GradeSearchItems, InclusionPrice, MeasItems, MfgInclusionData, MfgMeasurementData, MfgPricingRequest, RapPriceRequest } from 'shared/businessobjects';
import { Router } from '@angular/router';
import * as xlsx from 'xlsx';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { AccountingConfig, IdentityDNorm, InventoryItemMeasurement, InventoryItems, LedgerDNorm, PackingItem, StoneOrgDNorm, TaxType, Transaction, TransactionItem, TransactItemDNorm } from '../../../../entities';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import * as moment from 'moment';
import { fromEvent } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.css']
})
export class PurchaseComponent implements OnInit {
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  @Output() toggleClose: EventEmitter<boolean> = new EventEmitter();
  @Input() transactionObj: Transaction = new Transaction();
  public isPackinglistDialog: boolean = false
  public filterTax: string = '';
  public filterTaxChk: boolean = true;
  public showTaxSection: boolean = false;

  //#region Objects | Arrays
  public isEdit = false;
  public fxCredentials!: fxCredential;

  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public mySelectionPackage: string[] = [];

  public mySelectionTrans: string[] = [];

  public purchaseTransactionObj: Transaction = new Transaction();

  public transactionItemObj: TransactionItem = new TransactionItem();

  public inventoryExcelItems: InventoryExcelItems[] = [];
  public errorMessagesByStoneId: InverntoryError[] = [];

  public accountingConfigData: AccountingConfig = new AccountingConfig();
  public organizationAddress: Address = new Address();

  public purchaseTotalAmount = 0;
  public purchaseTotalTaxAmount: number = 0;

  public validAddAmtLimit = true;

  public stoneSearch = '';
  public certiSearch = '';

  public editableItemIndex = -1;

  public listCurrencyType: Array<{ text: string; value: string }> = [];

  public advancePaymentFlag: boolean = false;
  public advancePaymentReceiptTransaction: Transaction = new Transaction();
  public totalPacketAmount: number = 0;
  //#endregion

  //#region Master Config
  public masterConfigList!: MasterConfig;
  public allTheShapes!: MasterDNorm[];
  public allColors!: MasterDNorm[];
  public allClarities!: MasterDNorm[];
  public allTheFluorescences!: MasterDNorm[];
  public allTheCPS!: MasterDNorm[];
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  //#endregion

  //#region Dropdown Data
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public defaultDropdownItem = { text: 'Select item...', value: '' };

  public listPartyItems: Array<{ text: string; value: string }> = [];
  public listTax: Array<{ name: string; isChecked: boolean }> = [];
  public allTheTax: TaxType[] = [];
  public taxTypesZ: string[] = [];
  public partyItems: LedgerDNorm[] = [];

  public selectedParty = "";

  public listTransactItemItems: Array<{ text: string; value: string }> = [];
  public transactItemsDNorm: TransactItemDNorm[] = [];
  public selectedTransactItem = "";
  public invStatus: string = StoneStatus.Transit.toString();
  public transitStatus: string = StoneStatus.Transit.toString();
  public stockStatus: string = StoneStatus.Stock.toString();
  public isStockTallyEnable: boolean = false;
  //#endregion

  //#region Barcode Search
  @ViewChild('StoneTxtInput') stoneTxtInput!: ElementRef;
  @ViewChild('CertificateTxtInput') certificateTxtInput!: ElementRef;
  //#endregion

  constructor(private router: Router,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    public utilityService: UtilityService,
    private ledgerService: LedgerService,
    private pricingService: PricingService,
    private commuteService: CommuteService,
    private masterConfigService: MasterConfigService,
    private transactionService: TransactionService,
    private inventoryService: InventoryService,
    private inventoryUploadService: InventoryUploadService,
    private accountingconfigService: AccountingconfigService,
    private organizationService: OrganizationService,
    private orderService: OrderService,
    private measureGradeService: MeasureGradeService,
    private labService: LabService,
    private inwardMemoService: InwardMemoService,
    private transactItemService: TransactItemService,
    private accountConfigService: AccountingconfigService) { }

  public async ngOnInit() {
    let enbleST = await this.utilityService.startIntervalCheck();

    if (enbleST)
      await this.checkStockTallyEnable();

    this.defaultMethodsLoad();
  }

  //#region Default Method
  public async defaultMethodsLoad() {
    try {
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      if (this.fxCredentials == null || this.fxCredentials?.origin == null || (this.fxCredentials?.origin.toLowerCase() != 'accounts' && this.fxCredentials?.origin.toLowerCase() != 'admin')) {
        this.alertDialogService.show('You are not allow to see order detail!');
        this.router.navigate(["dashboard"]);
        return;
      }
      this.spinnerService.show();
      if (this.transactionObj.id != null && this.transactionObj.id.length > 0)
        this.isEdit = true;

      this.showTaxSection = this.fxCredentials?.organization.toLowerCase() == 'glowstar' || this.fxCredentials?.organization.toLowerCase() == 'sarjuimpex';

      await this.loadParty();
      await this.loadTaxList();
      await this.loadMasterConfig();
      await this.loadAccountConfigDetail();
      await this.loadTransactItemDNorm();
      await this.loadOrganizationData();

      if (!this.isEdit)
        this.clearTransactionData();
      else
        await this.validateEditObj();

      setTimeout(() => {
        this.onAddStones();
        this.onCertificate();
      }, 1000);
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Data not load!');
    }
  }
  //#endregion

  //#region Check Stock Tally Enable Method
  public async checkStockTallyEnable() {
    try {
      this.isStockTallyEnable = await this.commuteService.checkIsStockTallyEnable();

      if (this.isStockTallyEnable) 
        return this.alertDialogService.show('System cannot proceed with the sale transaction, purchase, and delivery because stock tally is enabled');

    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }
  //#endregion

  //#region Master Config
  public async loadMasterConfig() {
    this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
    this.allTheShapes = this.masterConfigList.shape;
    this.allColors = this.masterConfigList.colors;
    this.allClarities = this.masterConfigList.clarities;
    this.allTheFluorescences = this.masterConfigList.fluorescence;
    this.allTheCPS = this.masterConfigList.cps;

    this.measurementData = this.masterConfigList.measurements;
    this.measurementConfig = this.masterConfigList.measurementConfig;

    Object.values(listCurrencyType).forEach(z => { this.listCurrencyType.push({ text: z.toString(), value: z.toString() }); });
  }
  //#endregion

  //#region Init Data
  public async initTransactionData() {
    try {
      if (!this.isEdit) {
        this.purchaseTransactionObj.transactionType = TransactionType.Purchase.toString();
        this.purchaseTransactionObj.fromLedger = this.accountingConfigData.purchaseLedger;
        this.purchaseTransactionObj.number = (this.accountingConfigData.lastInvoiceNum + 1).toString();
        this.purchaseTransactionObj.transactionDetail.toCurrency = listCurrencyType.USD.toString();
        this.purchaseTransactionObj.transactionDetail.toCurRate = 1;
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Data load fail, Try again later!');
    }
  }

  public async loadAccountConfigDetail() {
    try {
      this.accountingConfigData = await this.accountingconfigService.getAccoutConfig();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async loadParty() {
    try {
      let ledgerType: string[] = ['Suppliers']
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

  public async loadTaxList() {
    this.allTheTax = await this.accountConfigService.getTaxTypesList();
    this.allTheTax.forEach(z => { this.listTax.push({ name: z.name, isChecked: false }); });
  }

  public async loadOrganizationData() {
    try {
      this.organizationAddress = await this.organizationService.getOrganizationAddressByEmployee(this.fxCredentials.id);

      //Add country from organization if not exists in branch address
      if (this.organizationAddress.country == null) {
        let orgAddress = await this.organizationService.getOrganizationDNorm();
        if (orgAddress && orgAddress.length > 0)
          this.organizationAddress.country = orgAddress[0].address.country;
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Organization not load, Try gain later!');
    }
  }

  public async loadTransactItemDNorm() {
    try {
      let data = await this.transactItemService.getTransactItemDNorm();
      if (data) {
        this.transactItemsDNorm = data;
        this.listTransactItemItems = [];
        this.transactItemsDNorm.forEach(z => { this.listTransactItemItems.push({ text: z.name, value: z.id }); });
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Transact Item not load, Try gain later!');
    }
  }
  //#endregion

  //#region Transaction Package File Import
  public async onSelectExcelFile(event: Event) {
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

        for (let i = 0; i < target.files.length; i++) {
          let file = target.files[i];
          let fileReader = new FileReader();
          this.inventoryExcelItems = [];
          this.spinnerService.show();
          fileReader.onload = async (e) => {

            var arrayBuffer: any = fileReader.result;
            let data = new Uint8Array(arrayBuffer);
            let arr = new Array();

            for (let i = 0; i != data.length; ++i)
              arr[i] = String.fromCharCode(data[i]);

            let workbook = xlsx.read(arr.join(""), { type: "binary" });
            var inventoryFetchExcelItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any;
            if (inventoryFetchExcelItems && inventoryFetchExcelItems.length > 0) {
              // this.inventoryExcelItems = new Array<any>();

              for (let j = 0; j < inventoryFetchExcelItems.length; j++) {
                Object.keys(inventoryFetchExcelItems[j]).map(key => {
                  if (key.toLowerCase().trim() != key) {
                    inventoryFetchExcelItems[j][key.toLowerCase().trim()] = inventoryFetchExcelItems[j][key];
                    delete inventoryFetchExcelItems[j][key];
                  }
                });

                let newItem = await this.mappingExcelDataToInvExcelItems(inventoryFetchExcelItems, j);
                this.inventoryExcelItems.push(newItem);
              }

              //Check in Inward memo
              if (this.purchaseTransactionObj.toLedger && this.purchaseTransactionObj.toLedger.id && this.inventoryExcelItems.length > 0) {
                var excelStoneIds = this.inventoryExcelItems.map(z => z.stoneId);
                let res = await this.inwardMemoService.getInwardMemoInvsByStoneIds(excelStoneIds, this.purchaseTransactionObj.toLedger.id);
                if (res && res.length > 0) {
                  var inwardStoneIds = res.map(z => z.stoneId);
                  this.inventoryExcelItems = this.inventoryExcelItems.filter(z => !inwardStoneIds.includes(z.stoneId));

                  //Insert data from inward memo stones
                  res.forEach(z => {
                    let excelItem = this.mappingInventoryItemToExcelItem(z);
                    this.inventoryExcelItems.push(excelItem);
                  });
                }
              }

              //Get Pricing
              let excelInventories: InventoryExcelItems[] = JSON.parse(JSON.stringify(this.inventoryExcelItems))
              // this.inventoryExcelItems = await this.setBasePricing(this.inventoryExcelItems);
              if (this.inventoryExcelItems && this.inventoryExcelItems.length > 0)
                await this.checkValidationForAll(this.inventoryExcelItems);

              this.inventoryExcelItems = this.inventoryExcelItems.map(item => {
                const Item = excelInventories.find(x => x.stoneId === item.stoneId);
                const netAmount = Item ? Item.netAmount : 0;
                const discount = Item ? Item.discount : 0;
                const perCarat = Item ? Item.perCarat : 0;

                return {
                  ...item,
                  netAmount,
                  discount,
                  perCarat
                };
              });

              this.totalPacketAmount = 0;
              this.totalPacketAmount = Number((this.inventoryExcelItems.map(z => (z.netAmount ?? 0)).reduce((ty, u) => ty + u, 0)).toFixed(2));
              if (this.totalPacketAmount == 0)
                this.totalPacketAmount = Number((this.inventoryExcelItems.map(z => (z.rap ?? 0)).reduce((ty, u) => ty + u, 0)).toFixed(2));


              this.spinnerService.hide();
            }
          }

          fileReader.readAsArrayBuffer(file);
        }
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public async mappingExcelDataToInvExcelItems(excelData: any, excelIndex: number): Promise<InventoryExcelItems> {
    let newItem: InventoryExcelItems = new InventoryExcelItems();
    let data = excelData[excelIndex];

    newItem.stoneId = data["StoneId".toLowerCase()]?.toString().trim();
    newItem.kapan = data["Kapan".toLowerCase()]?.toString().trim();
    newItem.article = data["Article".toLowerCase()]?.toString().trim();
    newItem.shape = this.getDisplayNameFromMasterDNorm(data["Shape".toLowerCase()]?.toString().trim(), this.allTheShapes);
    newItem.weight = Number(data["Weight".toLowerCase()].toFixed(2));
    newItem.color = this.getDisplayNameFromMasterDNorm(data["Color".toLowerCase()]?.toString().trim(), this.allColors);
    newItem.clarity = this.getDisplayNameFromMasterDNorm(data["Clarity".toLowerCase()]?.toString().trim(), this.allClarities);
    newItem.cut = this.getDisplayNameFromMasterDNorm(data["Cut".toLowerCase()]?.toString().trim(), this.allTheCPS);
    newItem.polish = this.getDisplayNameFromMasterDNorm(data["Polish".toLowerCase()]?.toString().trim(), this.allTheCPS);
    newItem.symmetry = this.getDisplayNameFromMasterDNorm(data["Symmetry".toLowerCase()]?.toString().trim(), this.allTheCPS);
    newItem.fluorescence = this.getDisplayNameFromMasterDNorm(data["Fluorescence".toLowerCase()]?.toString().trim(), this.allTheFluorescences);

    //Get CPS value
    newItem.cps = this.utilityService.getCPSValue(newItem.shape, newItem.cut, newItem.polish, newItem.symmetry, this.masterConfigList.cutDetails);
    newItem.comments = data["Comments".toLowerCase()]?.toString().trim();
    newItem.bgmComments = data["BGMComments".toLowerCase()]?.toString().trim();
    newItem.depth = data["Depth".toLowerCase()]?.toString().trim();
    newItem.table = data["Table".toLowerCase()]?.toString().trim();
    newItem.length = data["Length".toLowerCase()]?.toString().trim();
    newItem.width = data["Width".toLowerCase()]?.toString().trim();
    newItem.height = data["Height".toLowerCase()]?.toString().trim();
    newItem.crownHeight = data["CrownHeight".toLowerCase()]?.toString().trim();
    newItem.crownAngle = data["CrownAngle".toLowerCase()]?.toString().trim();
    newItem.pavilionDepth = data["PavilionDepth".toLowerCase()]?.toString().trim();
    newItem.pavilionAngle = data["PavilionAngle".toLowerCase()]?.toString().trim();
    newItem.girdlePer = data["GirdlePer".toLowerCase()]?.toString().trim();
    newItem.ratio = data["Ratio".toLowerCase()]?.toString().trim();

    let girdleAll = this.measurementData.filter(item => item.type.toLowerCase().indexOf('girdle') !== -1);
    newItem.minGirdle = this.getDisplayNameFromMasterDNorm(data["MinGirdle".toLowerCase()]?.toString().trim(), girdleAll);
    newItem.maxGirdle = this.getDisplayNameFromMasterDNorm(data["MaxGirdle".toLowerCase()]?.toString().trim(), girdleAll);

    newItem.lab = data["Lab".toLowerCase()]?.toString().trim();
    newItem.certificateNo = data["CertificateNo".toLowerCase()]?.toString().trim();
    newItem.certiType = data["CertiType".toLowerCase()]?.toString().trim();
    newItem.flColor = data["FluorescenceColor".toLowerCase()]?.toString().trim();
    newItem.ktoS = data["KeytoSymbols".toLowerCase()]?.toString().trim();
    newItem.inscription = data["Inscription".toLowerCase()]?.toString().trim();
    newItem.discount = Number(data["Discount".toLowerCase()]?.toString().trim())
    newItem.perCarat = Number(data["PerCT".toLowerCase()]?.toString().trim())
    newItem.netAmount = Number(data["Amount".toLowerCase()]?.toString().trim());
    newItem.rap = Number(data["Rap".toLowerCase()]?.toString().trim());

    newItem.status = StoneStatus.Pricing.toString();

    newItem.orgId = this.fxCredentials.organizationId;
    newItem.orgName = this.fxCredentials.organization;
    newItem.deptId = this.fxCredentials.departmentId;
    newItem.deptName = this.fxCredentials.department;
    newItem.branchName = this.fxCredentials.branch;
    newItem.orgCode = this.fxCredentials.orgCode;

    if (this.organizationAddress) {
      newItem.country = this.organizationAddress.country;
      newItem.city = this.organizationAddress.city;
    }

    newItem.empName = this.fxCredentials.fullName;
    newItem.empId = this.fxCredentials.id;

    newItem.inWardFlag = null as any;

    if (newItem.depth == null || newItem.depth == undefined || newItem.depth == 0)
      this.calculateDept(newItem);

    this.calculateRap(newItem);

    return newItem;
  }

  public mappingPricingRequestData(item: InventoryExcelItems): MfgPricingRequest {
    let mesurement = new MfgMeasurementData();
    mesurement.TblDepth = item.depth ?? 0;
    mesurement.TblAng = item.table ?? 0;
    mesurement.Length = item.length ?? 0;
    mesurement.Width = item.width ?? 0;
    mesurement.Height = item.height ?? 0;
    mesurement.CrHeight = item.crownHeight ?? 0;
    mesurement.CrAngle = item.crownAngle ?? 0;
    mesurement.PvlDepth = item.pavilionDepth ?? 0;
    mesurement.PvlAngle = item.pavilionAngle ?? 0;
    mesurement.StarLength = 0;
    mesurement.LowerHalf = 0;
    mesurement.GirdlePer = item.girdlePer ?? 0;
    mesurement.MinGirdle = item.minGirdle;
    mesurement.MaxGirdle = item.maxGirdle;
    mesurement.Ratio = item.ratio ?? 0;

    let req: MfgPricingRequest = {
      Lab: (item.lab && item.lab.length > 0) ? item.lab.toUpperCase() : "GIA",
      Rapver: "NONE",
      Id: item.stoneId,
      Shape: item.shape?.toUpperCase(),
      Weight: item.weight,
      Color: (item.color?.toUpperCase() == "O" || item.color?.toUpperCase() == "P") ? "M" : item.color?.toUpperCase(),
      Clarity: item.clarity?.toUpperCase(),
      Cut: item.cut?.toUpperCase(),
      Polish: item.polish?.toUpperCase(),
      Symmetry: item.symmetry?.toUpperCase(),
      Flour: item.fluorescence?.toUpperCase(),
      InclusionPrice: new MfgInclusionData(),
      MeasurePrice: mesurement,
      IGrade: "",
      MGrade: ""
    };

    return req;
  }

  private async setBasePricing(data: InventoryExcelItems[]): Promise<InventoryExcelItems[]> {
    try {
      let reqList: MfgPricingRequest[] = [];
      data.forEach(z => {
        if (z.shape && z.inWardFlag != 'I') {
          reqList.push(this.mappingPricingRequestData(z));
        }
      });

      let response = await this.pricingService.getBasePrice(reqList);
      if (response && response.length > 0) {
        for (let index = 0; index < data.length; index++) {
          let z = data[index];
          let target = response.find(a => a.id == z.stoneId);
          if (target && target.rapPrice != null && target.rapPrice > 0) {
            if (target.error == null) {
              target = this.utilityService.setAmtForPricingDiscountResponse(target, z.weight);
              z.rap = target.rapPrice;
              z.discount = target.discount;
              z.netAmount = target.amount;
              z.perCarat = target.dCaret;
            }
            else {
              z.rap = target.rapPrice;
              z.discount = null as any;
              z.netAmount = null as any;
              z.perCarat = null as any;
            }
          }
          else
            z = await this.getRapPriceData(z);
        }
      }
      return data;
    }
    catch (error: any) {
      console.error(error);
      this.utilityService.showNotification('Pricing not get, Try again later!', 'Warning');
      return data;
    }
  }

  public async getRapPriceData(newItem: InventoryExcelItems): Promise<InventoryExcelItems> {
    try {
      if (newItem.shape != null) {
        let rapPrice: RapPriceRequest = {
          shape: newItem.shape,
          weight: newItem.weight,
          color: newItem.color,
          clarity: newItem.clarity
        }

        let pricing = await this.commuteService.getRapPrice(rapPrice);
        if (pricing)
          newItem.rap = pricing.price;
        else
          newItem.rap = null as any;
      }
      else
        newItem.rap = null as any;

      newItem.discount = null as any;
      newItem.netAmount = null as any;
      newItem.perCarat = null as any;
    }
    catch (error: any) {
      console.error(error);

      newItem.rap = null as any;
      newItem.discount = null as any;
      newItem.netAmount = null as any;
      newItem.perCarat = null as any;
    }
    return newItem;
  }

  public getDisplayNameFromMasterDNorm(name: string, list: MasterDNorm[]): string {
    if (name && name.length > 0)
      var obj = list.find(c => c.name.toLowerCase() == name.toLowerCase() || c.displayName?.toLowerCase() == name.toLowerCase() || (c.optionalWords && c.optionalWords.length > 0 && c.optionalWords.map(u => u.toLowerCase().trim()).includes(name.toLowerCase())));
    return obj?.name ?? null as any;
  }

  public calculateRap(target: InventoryExcelItems): void {
    if (target) {
      target.length = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.length?.toString() ?? '0'));
      target.width = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.width?.toString() ?? '0'));
      target.height = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.height?.toString() ?? '0'));

      var max = ((target.length ?? 0) > (target.width ?? 0)) ? (target.length ?? 0) : (target.width ?? 0);
      var min = ((target.width ?? 0) > (target.length ?? 0)) ? (target.length ?? 0) : (target.width ?? 0);

      if (target.shape?.toLowerCase() == 'hb')
        target.ratio = min / max;
      else
        target.ratio = max / min;

      target.ratio = this.utilityService.ConvertToFloatWithDecimal(target.ratio ?? 0);
    }
  }

  public calculateDept(target: InventoryExcelItems): void {
    if (target.height && (target.length || target.width)) {
      target.length = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.length?.toString() ?? '0'));
      target.width = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.width?.toString() ?? '0'));
      target.height = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.height?.toString() ?? '0'));
      if (target.shape?.toLowerCase() == 'rbc')
        target.depth = ((target.height ?? 0) / (target.length ?? 0)) * 100;
      else if (target.shape?.toLowerCase() == 'hb') {
        let val = (target.length ?? 0);
        if ((target.length ?? 0) < (target.width ?? 0))
          val = (target.width ?? 0);
        target.depth = ((target.height ?? 0) / val) * 100;
      }
      else {
        let val = (target.length ?? 0);
        if ((target.length ?? 0) > (target.width ?? 0))
          val = (target.width ?? 0);
        target.depth = ((target.height ?? 0) / val) * 100;
      }
      if (target.depth == Infinity || target.depth == 0)
        target.depth = null as any;
      else
        target.depth = this.utilityService.ConvertToFloatWithDecimal(target.depth ?? 0);
    }
    else
      target.depth = null as any;
  }

  public async checkValidationForAll(existData: InventoryExcelItems[]) {
    try {
      let notValidRap: string[] = [];
      notValidRap = existData.filter(z => z.rap == null || z.rap == 0).map(z => z.stoneId);

      //#region validation for exist stones
      let fetchExcelIds: string[] = existData.filter(x => x.inWardFlag != 'I').map((x: any) => x.stoneId);

      //Do not check in Sold Stone
      if (fetchExcelIds.length > 0) {
        let existStoneIds = await this.inventoryUploadService.getStoneIdsExistOrNotForPurchase(fetchExcelIds)
        if (existStoneIds && existStoneIds.length > 0) {
          this.validateValues(existData, existStoneIds, "StoneId is already Exist");
          notValidRap = notValidRap.filter(z => !existStoneIds.includes(z));
        }
      }
      //#endregion

      //#region  validation for shape
      var notValidShapeId: string[] = existData.filter(z => z.shape == null).map(z => z.stoneId);
      this.validateValues(existData, notValidShapeId, "Please add valid shape");
      notValidRap = notValidRap.filter(z => !notValidShapeId.includes(z));
      //#endregion

      //#region valid for kapan rate
      var notValidKapanRateId: string[] = existData.filter(z => z.netAmount == null || z.netAmount == 0).map(z => z.stoneId);
      this.validateValues(existData, notValidKapanRateId, "Please add valid amount");
      notValidRap = notValidRap.filter(z => !notValidKapanRateId.includes(z));

      //#region  validation for color
      var notValidColorId: string[] = existData.filter(z => z.color == null).map(z => z.stoneId);
      this.validateValues(existData, notValidColorId, "Please add valid color");
      notValidRap = notValidRap.filter(z => !notValidColorId.includes(z));
      //#endregion

      //#region  validation for clarity
      var notValidClarityId: string[] = existData.filter(z => z.clarity == null).map(z => z.stoneId);
      this.validateValues(existData, notValidClarityId, "Please add valid clarity");
      notValidRap = notValidRap.filter(z => !notValidClarityId.includes(z));
      //#endregion

      //#region  validation for fluorescence
      var notValidFlourId: string[] = existData.filter(z => z.fluorescence == null).map(z => z.stoneId);
      this.validateValues(existData, notValidFlourId, "Please add valid fluorescence");
      notValidRap = notValidRap.filter(z => !notValidFlourId.includes(z));
      //#endregion

      //#region  validation for cut
      var notValidCutId: string[] = existData.filter(z => z.cut == null).map(z => z.stoneId);
      this.validateValues(existData, notValidCutId, "Please add valid cut");
      notValidRap = notValidRap.filter(z => !notValidCutId.includes(z));
      //#endregion

      //#region  validation for polish
      var notValidPolishId: string[] = existData.filter(z => z.polish == null).map(z => z.stoneId);
      this.validateValues(existData, notValidPolishId, "Please add valid polish");
      notValidRap = notValidRap.filter(z => !notValidPolishId.includes(z));
      //#endregion

      //#region  validation for symmetry
      var notValidSymmId: string[] = existData.filter(z => z.symmetry == null).map(z => z.stoneId);
      this.validateValues(existData, notValidSymmId, "Please add valid symmetry");
      notValidRap = notValidRap.filter(z => !notValidSymmId.includes(z));
      //#endregion

      //#region  validation for Girdle
      var notValidMinGirdleId: string[] = existData.filter(z => z.minGirdle == null).map(z => z.stoneId);
      this.validateValues(existData, notValidMinGirdleId, "Please add valid Girdle");
      notValidRap = notValidRap.filter(z => !notValidMinGirdleId.includes(z));

      var notValidMaxGirdleId: string[] = existData.filter(z => z.maxGirdle == null).map(z => z.stoneId);
      this.validateValues(existData, notValidMaxGirdleId, "Please add valid Girdle");
      notValidRap = notValidRap.filter(z => !notValidMaxGirdleId.includes(z));
      //#endregion

      this.validateValues(existData, notValidRap, "Pricing not Exist");
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public validateValues(data: any, ids: string[], message: string, isPriceAvai: boolean = true) {
    ids.forEach(element => {
      let messageArray = [];
      messageArray.push(message)
      let findErrorIndex = this.errorMessagesByStoneId.findIndex(x => x.stoneId == element);
      if (findErrorIndex >= 0) {
        let messageIndex = this.errorMessagesByStoneId[findErrorIndex].messageList.findIndex(x => x == message);
        if (messageIndex < 0)
          this.errorMessagesByStoneId[findErrorIndex].messageList.push(message)
      }
      else
        this.errorMessagesByStoneId.push({ stoneId: element, messageList: messageArray });
      let index = data.findIndex((x: any) => x.stoneId == element);
      if (index >= 0) {
        data[index].isDisabled = true;
        data[index].isPriceAvailable = isPriceAvai;
      }
    });
  }

  public removeExcelInv() {
    this.mySelectionPackage.forEach(z => {
      let index = this.inventoryExcelItems.findIndex(a => a.stoneId == z);
      if (index > -1)
        this.inventoryExcelItems.splice(index, 1);
    });
    this.totalPacketAmount = Number((this.inventoryExcelItems.map(z => (z.netAmount ?? 0)).reduce((ty, u) => ty + u, 0)).toFixed(2));
    this.mySelectionPackage = [];
  }

  public saveExcelItemInTransaction() {

    if (this.purchaseTransactionObj.toLedger.id == null || this.purchaseTransactionObj.toLedger.id == undefined) {
      this.alertDialogService.show('Please select party!');
      return;
    }

    this.purchaseTransactionObj.packingList = [];
    if (this.inventoryExcelItems && this.inventoryExcelItems.length > 0) {
      var notValidStone = this.inventoryExcelItems.filter(z => z.isDisabled == true);
      if (notValidStone.length > 0) {
        this.alertDialogService.show(notValidStone.length + " Stone(s) not valid<br />StoneId(s): " + notValidStone.map(z => z.stoneId).join(","));
        return;
      }

      this.purchaseTransactionObj.packingList = this.mappingExcelInvToTransactionPackage();
      this.AddItemByPackageList();
      this.utilityService.showNotification(this.purchaseTransactionObj.packingList.length + ' package list updated!');
      this.isPackinglistDialog = false;
    }
  }

  public AddItemByPackageList() {
    let transItem = this.transactItemsDNorm.find(z => z.name.toUpperCase() == 'CUT & POLISH DIAMONDS');
    if (transItem && transItem != null && transItem != undefined) {
      let existsItemIndex = this.purchaseTransactionObj.items.findIndex(z => z.item.id == transItem?.id);
      if (existsItemIndex > -1)
        this.purchaseTransactionObj.items.splice(existsItemIndex, 1);

      if (this.purchaseTransactionObj.packingList.length > 0) {

        let totalPacketWeight = (Number(this.purchaseTransactionObj.packingList.reduce((acc, cur) => acc + Number(cur.weight), 0).toFixed(2))) ?? 0;

        let transactionItemObj = new TransactionItem();
        transactionItemObj.item = transItem;
        transactionItemObj.quantity = this.purchaseTransactionObj.packingList.length;
        transactionItemObj.weight = totalPacketWeight;
        transactionItemObj.amount = this.totalPacketAmount;
        transactionItemObj.rate = this.utilityService.ConvertToFloatWithDecimal(this.totalPacketAmount / totalPacketWeight);
        transactionItemObj.total = this.totalPacketAmount;
        transactionItemObj.discPerc = 0;
        transactionItemObj.discount = 0;
        transactionItemObj.taxAmount = 0;

        this.purchaseTransactionObj.items.push(JSON.parse(JSON.stringify(transactionItemObj)));
      }

      this.calculateTransactionItems();
    }
    else
      this.alertDialogService.show('Please add "CUT & POLISH DIAMONDS" in Transact Item');
  }

  public mappingExcelInvToTransactionPackage(): PackingItem[] {
    let items: PackingItem[] = [];

    let inventoryExcelItems: InventoryExcelItems[] = JSON.parse(JSON.stringify(this.inventoryExcelItems));
    inventoryExcelItems = inventoryExcelItems.filter(z => z.isDisabled != true);
    inventoryExcelItems.forEach(z => {
      let obj = new PackingItem();
      obj.invId = '';
      obj.stoneId = z.stoneId;
      obj.shape = z.shape;
      obj.weight = z.weight;
      obj.color = z.color;
      obj.clarity = z.clarity;
      obj.certificateNo = z.certificateNo;
      obj.certiType = z.certiType;

      obj.price.rap = z.rap ?? 0;
      obj.price.discount = z.discount ?? 0;
      obj.price.perCarat = z.perCarat ?? 0;
      obj.price.netAmount = z.netAmount ?? 0;

      obj.isInward = (z.inWardFlag != null && z.inWardFlag != undefined) ? true : false;
      items.push(obj);
    });

    return items;
  }

  public fetchError(id: string) {
    return this.errorMessagesByStoneId.find(x => x.stoneId == id)
  }
  //#endregion

  //#region Transaction Item Add / Remove
  public addTransactionItem() {
    if (!this.validateTransactionItemData())
      return;

    this.calculateTransactItem();

    //Set index number for delete Item
    this.transactionItemObj.index = this.purchaseTransactionObj.items.length.toString();
    if (this.editableItemIndex != -1) {
      this.purchaseTransactionObj.items[this.editableItemIndex] = this.transactionItemObj;
      this.editableItemIndex = -1;
    }
    else
      this.purchaseTransactionObj.items.push(JSON.parse(JSON.stringify(this.transactionItemObj)));

    this.transactionItemObj = new TransactionItem();
    this.selectedTransactItem = '';
    this.mySelectionTrans = [];
    this.calculateTransactionItems();
  }

  public editItem(item: TransactionItem, index: number) {
    this.transactionItemObj = JSON.parse(JSON.stringify(item));
    this.selectedTransactItem = JSON.parse(JSON.stringify(item.item.id));
    this.editableItemIndex = JSON.parse(JSON.stringify(index));
    this.mySelectionTrans.push(item.index.toString());
  }

  public calculateTransactItem() {
    this.transactionItemObj.amount = this.utilityService.ConvertToFloatWithDecimal((this.transactionItemObj.rate * this.transactionItemObj.weight));

    if (this.transactionItemObj.discPerc != null && this.transactionItemObj.discPerc > 0)
      this.transactionItemObj.discount = this.utilityService.ConvertToFloatWithDecimal((this.transactionItemObj.amount * this.transactionItemObj.discPerc / 100));
    else {
      this.transactionItemObj.discount = 0;
      this.transactionItemObj.discPerc = 0;
    }

    if (this.transactionItemObj.item.taxTypes != null) {
      this.transactionItemObj.taxAmount = 0;
      this.transactionItemObj.item.taxTypes.forEach((ele) => {
        this.transactionItemObj.taxAmount += this.utilityService.ConvertToFloatWithDecimal((this.transactionItemObj.amount * ele.rate / 100));
      });
    }
    else
      this.transactionItemObj.taxAmount = 0;

    this.transactionItemObj.total = this.utilityService.ConvertToFloatWithDecimal(this.transactionItemObj.amount - this.transactionItemObj.discount + this.transactionItemObj.taxAmount);
  }

  public calculateTransactionItems(additionalAmtManualChange = false) {
    this.purchaseTransactionObj.amount = this.utilityService.ConvertToFloatWithDecimal(this.purchaseTransactionObj.items.map(z => z.amount).reduce((ty, u) => ty + u, 0));
    if (this.showTaxSection) {
      if (this.taxTypesZ.length > 0) {
        let selectedTaxes = this.allTheTax.filter(z => this.taxTypesZ.includes(z.name));
        let taxtAmount = 0;
        selectedTaxes.forEach(z => {
          taxtAmount += this.utilityService.ConvertToFloatWithDecimal((this.purchaseTransactionObj.amount * z.rate / 100));
        });
        this.purchaseTotalTaxAmount = this.utilityService.ConvertToFloatWithDecimal(taxtAmount);
      }
      else
        this.purchaseTotalTaxAmount = 0;
    }

    this.purchaseTransactionObj.amount = this.utilityService.ConvertToFloatWithDecimal(this.purchaseTransactionObj.items.map(z => z.amount).reduce((ty, u) => ty + u, 0));
    this.purchaseTransactionObj.discount = this.utilityService.ConvertToFloatWithDecimal(this.purchaseTransactionObj.items.map(z => z.discount).reduce((ty, u) => ty + u, 0));
    this.purchaseTransactionObj.taxAmount = this.purchaseTotalTaxAmount + this.utilityService.ConvertToFloatWithDecimal(this.purchaseTransactionObj.items.map(z => z.taxAmount).reduce((ty, u) => ty + u, 0));
    this.purchaseTotalAmount = this.utilityService.ConvertToFloatWithDecimal(this.purchaseTransactionObj.items.map(z => z.total).reduce((ty, u) => ty + u, 0) + this.purchaseTransactionObj.taxAmount);

    let addAmt = this.utilityService.setadditionalAmountForTransaction(this.purchaseTotalAmount);
    if (additionalAmtManualChange)
      addAmt = parseFloat((this.purchaseTransactionObj.addAmount ?? 0).toString());
    else {
      addAmt = 0;
      this.purchaseTransactionObj.addAmount = addAmt;
    }

    if (addAmt.toString() == '' || addAmt.toString() == 'NaN' || addAmt.toString() == 'undefined' || addAmt.toString() == 'null')
      addAmt = 0;

    this.purchaseTransactionObj.netTotal = this.utilityService.ConvertToFloatWithDecimal((addAmt + this.purchaseTotalAmount));
    this.calculateCCAmt();
  }

  public validateTransactionItemData(): boolean {
    if (this.transactionItemObj.item == null || this.transactionItemObj.item?.name == null) {
      this.alertDialogService.show('Please select Transact Item!');
      return false;
    }
    else if (this.transactionItemObj.quantity == null) {
      this.alertDialogService.show('Please enter quantity!');
      return false;
    }
    else if (!this.transactionItemObj.weight) {
      this.alertDialogService.show('Please enter weight!');
      return false;
    }
    else if (this.transactionItemObj.rate == null) {
      this.alertDialogService.show('Please enter rate!');
      return false;
    }
    return true;
  }

  public removeTransactionItems() {
    this.mySelectionTrans.forEach(z => {
      let index = this.purchaseTransactionObj.items.findIndex(a => a.index == z);
      if (index > -1)
        this.purchaseTransactionObj.items.splice(index, 1);
    });
    this.mySelectionTrans = [];

    this.transactionItemObj = new TransactionItem();
    this.selectedTransactItem = '';

    this.calculateTransactionItems();
  }
  //#endregion

  //#region Save | Add Purchase Transaction
  public async saveTransaction(isNew = false) {
    if (this.purchaseTransactionObj.items == null || this.purchaseTransactionObj.items.length == 0) {
      this.alertDialogService.show('Please add at least one transaction item!');
      return;
    }

    if (this.purchaseTransactionObj.toLedger.id == null || this.purchaseTransactionObj.toLedger.id == undefined) {
      this.alertDialogService.show('Please select party!');
      return;
    }

    this.alertDialogService.ConfirmYesNo(`Are you sure you want to add purchase transaction${this.advancePaymentFlag ? ' with Advance Payment' : ''}`, "Add Transaction")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {

            if (this.advancePaymentFlag) {
              if (this.advancePaymentReceiptTransaction.transactionDetail.toCurrency != this.purchaseTransactionObj.transactionDetail.toCurrency) {
                this.alertDialogService.show('Advance Payment & Purchase Currency not match!');
                return;
              }
            }

            this.spinnerService.show();
            this.purchaseTransactionObj.invPurchaseStatus = this.invStatus;

            if (this.purchaseTransactionObj.packingList && this.purchaseTransactionObj.packingList.length > 0) {

              let inWardMemoStones = this.purchaseTransactionObj.packingList.filter(z => z.isInward == true);
              if (inWardMemoStones.length > 0) {
                //Update in Inward Memo for return stone
                let stoneIds = inWardMemoStones.map(z => z.stoneId);
                await this.inwardMemoService.updateForPurchasedStones(stoneIds);
              }

              let purchaseStones = this.purchaseTransactionObj.packingList.filter(z => z.isInward == false);
              if (purchaseStones.length > 0) {

                let stoneIds = purchaseStones.map(z => z.stoneId);
                let req: InvUpdateItem = new InvUpdateItem();
                req.supplierCode = this.fxCredentials.orgCode;
                req.heldBy = this.fxCredentials.id ? this.fxCredentials.fullName : '';

                if (this.purchaseTransactionObj.invPurchaseStatus == StoneStatus.Stock.toString()) {

                  let orderStoneIds = await this.orderService.getOrderStonesByStoneIds(stoneIds);
                  if (orderStoneIds.length > 0) {

                    req.stoneIds = orderStoneIds;
                    req.status = StoneStatus.Order.toString();
                    let res = await this.commuteService.updateBulkInventoryItemsForPI(req);
                    if (res && res.length > 0) {

                      res.forEach(z => {
                        this.UpdateInvResponse(z, req.status, true);
                      });

                      //insert stone data exist in frontOffice
                      let insertRes = await this.inventoryService.insertInventories(res);
                      if (insertRes)
                        stoneIds = stoneIds.filter(x => !orderStoneIds.includes(x));
                    }
                  }

                  //Update stone in FO and Insert stone in BO as Stonstatus is 'Stock'
                  if (stoneIds.length > 0) {

                    req.stoneIds = stoneIds;
                    req.status = StoneStatus.Stock.toString();
                    let res = await this.commuteService.updateBulkInventoryItemsForPI(req);
                    if (res && res.length > 0) {

                      let insertedStoneIds = res.map(z => z.stoneId);
                      res.forEach(z => {
                        this.UpdateInvResponse(z, req.status, false);
                      });

                      //insert stone data exist in frontOffice
                      let insertRes = await this.inventoryService.insertInventories(res);
                      if (insertRes)
                        stoneIds = stoneIds.filter(x => !insertedStoneIds.includes(x));
                    }

                    //Insert stone in Backoffice as StoneStatus is 'Pricing' -- New Purchase
                    if (stoneIds.length > 0) {

                      let nonExistsData = purchaseStones.filter(z => stoneIds.includes(z.stoneId));
                      let excelData = this.inventoryExcelItems.filter(z => nonExistsData.map(a => a.stoneId).includes(z.stoneId) && z.isDisabled != true && z.inWardFlag == null);
                      await this.InvExcelUpload(excelData);
                    }
                    else
                      await this.insertTransaction();
                  }
                  else
                    await this.insertTransaction();
                }
                else {

                  req.stoneIds = stoneIds;
                  req.status = StoneStatus.Transit.toString();
                  let res = await this.commuteService.updateBulkInventoryItemsForPI(req);
                  if (res && res.length > 0) {

                    let insertedStoneIds = res.map(z => z.stoneId);
                    res.forEach(z => {
                      this.UpdateInvResponse(z, req.status, false);
                    });

                    //insert stone data exist in frontOffice
                    let insertRes = await this.inventoryService.insertInventories(res);
                    if (insertRes)
                      stoneIds = stoneIds.filter(x => !insertedStoneIds.includes(x));
                  }

                  //Insert stone in Backoffice as StoneStatus is 'Pricing' -- New Purchase
                  if (stoneIds.length > 0) {

                    let nonExistsData = purchaseStones.filter(z => stoneIds.includes(z.stoneId));
                    let excelData = this.inventoryExcelItems.filter(z => nonExistsData.map(a => a.stoneId).includes(z.stoneId) && z.isDisabled != true && z.inWardFlag == null);
                    await this.InvExcelUpload(excelData);
                  }
                  else
                    await this.insertTransaction();
                }
              }
              else
                await this.insertTransaction();
            }
            else
              await this.insertTransaction();

            if (!isNew)
              this.toggle.emit(false);
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Inventory not added, Please contact administrator!')
          }
        }
      });
  }

  public UpdateInvResponse(invItem: InventoryItems, stoneStatus: string, isHold: boolean) {
    invItem.stoneOrg = new StoneOrgDNorm();
    invItem.stoneOrg.orgId = this.fxCredentials.organizationId;
    invItem.stoneOrg.orgName = this.fxCredentials.organization;
    invItem.stoneOrg.deptId = this.fxCredentials.departmentId;
    invItem.stoneOrg.deptName = this.fxCredentials.department;
    invItem.stoneOrg.branchName = this.fxCredentials.branch;
    invItem.stoneOrg.orgCode = this.fxCredentials.orgCode;

    if (this.organizationAddress) {
      invItem.stoneOrg.country = this.organizationAddress.country;
      invItem.stoneOrg.city = this.organizationAddress.city;
    }

    invItem.status = stoneStatus;
    invItem.heldBy = this.fxCredentials.fullName;
    invItem.identity = new IdentityDNorm();
    invItem.identity.id = this.fxCredentials.id;
    invItem.identity.name = this.fxCredentials.fullName;
    invItem.identity.type = this.fxCredentials.origin;

    if (isHold) {
      invItem.isHold = true;
      invItem.holdBy = this.fxCredentials.fullName;
    }
    else {
      invItem.isHold = false;
      invItem.holdDate = null;
      invItem.holdBy = null as any;
    }
  }

  public async InvExcelUpload(inventoryExcelItems: InventoryExcelItems[]) {
    var stoneIds = await this.inventoryUploadService.saveInventoryFile(inventoryExcelItems, true);
    if (stoneIds && stoneIds.length > 0) {
      this.utilityService.showNotification('New inventory submitted!');
      await this.savePricingRequestDiamanto(inventoryExcelItems);
      await this.insertTransaction();
      this.inventoryExcelItems = [];
    }
  }

  public async savePricingRequestDiamanto(invExcelItems: InventoryExcelItems[]) {
    try {
      let invItems: InventoryItems[] = [];
      if (invExcelItems != null && invExcelItems.length > 0) {
        invExcelItems.forEach(z => { invItems.push(this.mappingInvExcelToInvItems(z)) });

        //Update IGrade, MGrade
        await this.UpdateInvGrade(invItems);

        let res = await this.commuteService.insertPricingRequest(invItems, "Purchase Stone", "Purchase");
        if (res)
          this.utilityService.showNotification('Pricing request submitted!');
        else
          this.alertDialogService.show('Pricing request not submitted, Please contact administrator!', 'error');
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show('Pricing request not inserted, Please try again later!', 'error');
      console.error(error);
    }
  }

  public mappingInvExcelToInvItems(invExcelItem: InventoryExcelItems): InventoryItems {
    let item: InventoryItems = new InventoryItems();
    item.stoneId = invExcelItem.stoneId;
    item.kapan = invExcelItem.kapan;
    item.article = invExcelItem.article;
    item.shape = invExcelItem.shape;
    item.weight = invExcelItem.weight;
    item.color = invExcelItem.color;
    item.clarity = invExcelItem.clarity;
    item.cut = invExcelItem.cut;
    item.polish = invExcelItem.polish;
    item.symmetry = invExcelItem.symmetry;
    item.fluorescence = invExcelItem.fluorescence;
    item.cps = invExcelItem.cps;
    item.comments = invExcelItem.comments;
    item.bgmComments = invExcelItem.bgmComments;
    item.measurement.depth = invExcelItem.depth ?? 0;
    item.measurement.table = invExcelItem.table ?? 0;
    item.measurement.length = invExcelItem.length ?? 0;
    item.measurement.width = invExcelItem.width ?? 0;
    item.measurement.height = invExcelItem.height ?? 0;
    item.measurement.crownHeight = invExcelItem.crownHeight ?? 0;
    item.measurement.crownAngle = invExcelItem.crownAngle ?? 0;
    item.measurement.pavilionDepth = invExcelItem.pavilionDepth ?? 0;
    item.measurement.pavilionAngle = invExcelItem.pavilionAngle ?? 0;
    item.measurement.girdlePer = invExcelItem.girdlePer ?? 0;
    item.measurement.minGirdle = invExcelItem.minGirdle ?? '';
    item.measurement.maxGirdle = invExcelItem.maxGirdle ?? '';
    item.measurement.ratio = invExcelItem.ratio ?? 0;

    item.basePrice.rap = invExcelItem.rap ?? 0;
    item.basePrice.discount = invExcelItem.discount ?? 0;
    item.basePrice.netAmount = invExcelItem.netAmount ?? 0;
    item.basePrice.perCarat = invExcelItem.perCarat ?? 0;

    item.lab = invExcelItem.lab?.toUpperCase();
    item.certificateNo = invExcelItem.certificateNo;
    item.certiType = invExcelItem.certiType;

    item.inclusion.flColor = invExcelItem.flColor;
    item.inclusion.ktoS = invExcelItem.ktoS;
    item.inscription = invExcelItem.inscription;
    item.status = StoneStatus.Lab.toString();

    item.stoneOrg.orgId = this.fxCredentials.organizationId;
    item.stoneOrg.orgName = this.fxCredentials.organization;
    item.stoneOrg.deptId = this.fxCredentials.departmentId;
    item.stoneOrg.deptName = this.fxCredentials.department;
    item.stoneOrg.branchName = this.fxCredentials.branch;
    item.stoneOrg.country = this.organizationAddress.country;
    item.stoneOrg.city = this.organizationAddress.city;
    item.stoneOrg.orgCode = this.fxCredentials.orgCode;
    item.identity.name = this.fxCredentials.fullName;
    item.identity.id = this.fxCredentials.id;
    item.identity.type = 'Employee';
    return item;
  }

  public async UpdateInvGrade(inv: InventoryItems[]) {
    try {
      let req: GradeSearchItems[] = [];
      inv.forEach(z => {
        let obj: GradeSearchItems = new GradeSearchItems();
        obj.id = z.stoneId;
        obj.lab = "GIA"//z.lab?.toUpperCase();
        obj.shape = z.shape?.toUpperCase();
        obj.size = Number(z.weight);
        obj.color = z.color?.toUpperCase();
        obj.clarity = z.clarity?.toUpperCase();
        obj.cut = z.cut?.toUpperCase();
        obj.polish = z.polish?.toUpperCase();
        obj.sym = z.symmetry?.toUpperCase();
        obj.fluo = z.fluorescence?.toUpperCase();

        let inclusionData: InclusionPrice = new InclusionPrice();
        inclusionData.brown = z.inclusion.brown?.toUpperCase();
        inclusionData.green = z.inclusion.green?.toUpperCase();
        inclusionData.milky = z.inclusion.milky?.toUpperCase();
        inclusionData.shade = z.inclusion.shade?.toUpperCase();
        inclusionData.sideBlack = z.inclusion.sideBlack?.toUpperCase();
        inclusionData.centerBlack = z.inclusion.centerBlack?.toUpperCase();
        inclusionData.sideWhite = z.inclusion.sideWhite?.toUpperCase();
        inclusionData.centerWhite = z.inclusion.centerWhite?.toUpperCase();
        inclusionData.openTable = z.inclusion.openTable?.toUpperCase();
        inclusionData.openCrown = z.inclusion.openCrown?.toUpperCase();
        inclusionData.openPavilion = z.inclusion.openPavilion?.toUpperCase();
        inclusionData.openGirdle = z.inclusion.openGirdle?.toUpperCase();
        if (z.inclusion.girdleCondition && z.inclusion.girdleCondition.length > 0)
          inclusionData.girdleCond.push(z.inclusion.girdleCondition?.toUpperCase());
        inclusionData.eFOC = z.inclusion.efoc?.toUpperCase();
        inclusionData.eFOP = z.inclusion.efop?.toUpperCase();
        inclusionData.culet = z.inclusion.culet?.toUpperCase();
        inclusionData.hNA = z.inclusion.hna?.toUpperCase();
        inclusionData.eyeClean = z.inclusion.eyeClean?.toUpperCase();

        let ktos = z.inclusion.ktoS?.split(',');
        if (ktos && ktos.length > 0) {
          inclusionData.kToS = [];
          for (let index = 0; index < ktos.length; index++) {
            const element = ktos[index];
            inclusionData.kToS.push(element.trim());
            obj.ktoS.push(element.trim());
          }
        }

        inclusionData.naturalOnGirdle = z.inclusion.naturalOnGirdle?.toUpperCase();
        inclusionData.naturalOnCrown = z.inclusion.naturalOnCrown?.toUpperCase();
        inclusionData.naturalOnPavillion = z.inclusion.naturalOnPavillion?.toUpperCase();
        inclusionData.flColor = z.inclusion.flColor?.toUpperCase();
        inclusionData.luster = z.inclusion.luster?.toUpperCase();
        inclusionData.bowTie = z.inclusion.bowtie?.toUpperCase();
        inclusionData.certiComment = z.inclusion.certiComment?.toUpperCase();

        obj.inclusion = inclusionData;
        obj.measurement = this.mappingMeasListForGrading(z.measurement);

        let girdleData: GirdleDNorm = new GirdleDNorm();
        girdleData.min = z.measurement.minGirdle?.toUpperCase();
        girdleData.max = z.measurement.maxGirdle?.toUpperCase();

        obj.girdle = girdleData;
        obj.certComment = [];

        req.push(obj);
      });

      let res = await this.measureGradeService.getPrice(req);
      if (res) {
        let result = await this.labService.updateInventoryGrading(res);
        if (result) {
          //Update in local array for pricing request
          inv.forEach(z => {
            let grading = res.find(a => a.id == z.stoneId);
            if (grading != null) {
              z.measurement.mGrade = grading.mGrade;
              z.inclusion.iGrade = grading.iGrade;
            }
          });

          this.utilityService.showNotification(`${result.length} stone(s) grade updated!`);
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong when get grade.');
    }
  }

  private mappingMeasListForGrading(measurment: InventoryItemMeasurement): MeasItems[] {
    let list: MeasItems[] = [];

    let measurData: MeasItems = new MeasItems();
    if (measurment.depth) {
      measurData.type = 'Depth';
      measurData.value = Number(measurment.depth);
      list.push(measurData);
    }

    if (measurment.table) {
      measurData = new MeasItems();
      measurData.type = 'Table';
      measurData.value = Number(measurment.table);
      list.push(measurData);
    }

    if (measurment.length) {
      measurData = new MeasItems();
      measurData.type = 'Length';
      measurData.value = Number(measurment.length);
      list.push(measurData);
    }

    if (measurment.width) {
      measurData = new MeasItems();
      measurData.type = 'Width';
      measurData.value = Number(measurment.width);
      list.push(measurData);
    }

    if (measurment.height) {
      measurData = new MeasItems();
      measurData.type = 'Height';
      measurData.value = Number(measurment.height);
      list.push(measurData);
    }

    if (measurment.crownHeight) {
      measurData = new MeasItems();
      measurData.type = 'CrHeight';
      measurData.value = Number(measurment.crownHeight);
      list.push(measurData);
    }

    if (measurment.crownAngle) {
      measurData = new MeasItems();
      measurData.type = 'CrAngle';
      measurData.value = Number(measurment.crownAngle);
      list.push(measurData);
    }

    if (measurment.pavilionDepth) {
      measurData = new MeasItems();
      measurData.type = 'PavDepth';
      measurData.value = Number(measurment.pavilionDepth);
      list.push(measurData);
    }

    if (measurment.pavilionAngle) {
      measurData = new MeasItems();
      measurData.type = 'PavAngle';
      measurData.value = Number(measurment.pavilionAngle);
      list.push(measurData);
    }

    if (measurment.ratio) {
      measurData = new MeasItems();
      measurData.type = 'Ratio';
      measurData.value = Number(measurment.ratio);
      list.push(measurData);
    }

    if (measurment.girdlePer) {
      measurData = new MeasItems();
      measurData.type = 'GirdlePer';
      measurData.value = Number(measurment.girdlePer);
      list.push(measurData);
    }

    return list;
  }

  public async insertTransaction() {
    try {

      if (this.advancePaymentFlag) {
        this.purchaseTransactionObj.paymentDetail.selectedTransactionId.push(this.advancePaymentReceiptTransaction.id);
        if ((this.advancePaymentReceiptTransaction.amount - this.advancePaymentReceiptTransaction.paidAmount) >= this.purchaseTransactionObj.ccAmount) {
          this.purchaseTransactionObj.paidAmount = this.purchaseTransactionObj.ccAmount;
          this.advancePaymentReceiptTransaction.paidAmount = this.advancePaymentReceiptTransaction.amount - this.purchaseTransactionObj.ccAmount;
        }
        else if ((this.purchaseTransactionObj.ccAmount - this.purchaseTransactionObj.paidAmount) > (this.advancePaymentReceiptTransaction.amount - this.advancePaymentReceiptTransaction.paidAmount)) {
          this.purchaseTransactionObj.paidAmount = this.purchaseTransactionObj.paidAmount + (this.advancePaymentReceiptTransaction.amount - this.advancePaymentReceiptTransaction.paidAmount);
        }
        this.purchaseTransactionObj.paidAmount = parseFloat(this.purchaseTransactionObj.paidAmount.toFixed(2));
      }

      if (this.purchaseTransactionObj.transactionDate != null)
        this.purchaseTransactionObj.transactionDate = this.utilityService.setUTCDateFilter(this.purchaseTransactionObj.transactionDate);

      this.purchaseTransactionObj.createdBy = this.fxCredentials.fullName;

      let res = await this.transactionService.insert(this.purchaseTransactionObj);
      if (res) {
        this.utilityService.showNotification('Purchase transaction added successfully! Transactions No: ' + res);
        this.clearTransactionData();
        this.spinnerService.hide();
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Purchase transaction not add, Please try again later!', 'error');
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Purchase transaction not add, Please try again later!', 'error')
    }
  }

  public async clearTransactionData() {
    this.mySelectionPackage = [];
    this.mySelectionTrans = [];
    this.purchaseTransactionObj = new Transaction();
    this.transactionItemObj = new TransactionItem();
    this.inventoryExcelItems = [];
    this.errorMessagesByStoneId = [];
    this.selectedParty = '';
    this.selectedTransactItem = '';
    this.purchaseTotalAmount = 0;
    this.calculateTransactionItems();
    await this.loadAccountConfigDetail();
    await this.initTransactionData();
  }
  //#endregion

  //#region Update Purchase Transaction
  public async updateTransaction() {
    if (this.purchaseTransactionObj.items == null || this.purchaseTransactionObj.items.length == 0) {
      this.alertDialogService.show('Please add at least one transaction item!');
      return;
    }

    this.alertDialogService.ConfirmYesNo(`Are you sure you want to update purchase transaction${this.advancePaymentFlag ? ' with Advance Payment' : ''}`, "Update Transaction")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            if (this.advancePaymentFlag) {
              if (this.advancePaymentReceiptTransaction.transactionDetail.toCurrency != this.purchaseTransactionObj.transactionDetail.toCurrency) {
                this.alertDialogService.show('Advance Payment & Purchase Currency not match!');
                return;
              }
              this.purchaseTransactionObj.paymentDetail.selectedTransactionId.push(this.advancePaymentReceiptTransaction.id);
              if ((this.advancePaymentReceiptTransaction.amount -this.advancePaymentReceiptTransaction.paidAmount) >= (this.purchaseTransactionObj.ccAmount -this.purchaseTransactionObj.paidAmount)) {
                this.advancePaymentReceiptTransaction.paidAmount = (this.purchaseTransactionObj.ccAmount -this.purchaseTransactionObj.paidAmount);
                this.purchaseTransactionObj.paidAmount = this.purchaseTransactionObj.ccAmount;
              }
              else if ((this.purchaseTransactionObj.ccAmount - this.purchaseTransactionObj.paidAmount) > (this.advancePaymentReceiptTransaction.amount -this.advancePaymentReceiptTransaction.paidAmount)) {
                this.purchaseTransactionObj.paidAmount = this.purchaseTransactionObj.paidAmount + (this.advancePaymentReceiptTransaction.amount -this.advancePaymentReceiptTransaction.paidAmount);
              }
              this.purchaseTransactionObj.paidAmount = parseFloat(this.purchaseTransactionObj.paidAmount.toFixed(2));
            }

            this.spinnerService.show();
            if (this.purchaseTransactionObj.packingList && this.purchaseTransactionObj.packingList.length > 0) {
              if (this.invStatus == StoneStatus.Stock.toString() && this.purchaseTransactionObj.invPurchaseStatus == StoneStatus.Transit.toString()) {

                let stoneStatus = this.invStatus;

                let purchaseStones = this.purchaseTransactionObj.packingList;
                if (purchaseStones.length > 0) {

                  let stoneIds = purchaseStones.map(z => z.stoneId);
                  let req: InvUpdateItem = new InvUpdateItem();
                  req.supplierCode = this.fxCredentials.orgCode;
                  req.heldBy = this.fxCredentials.id ? this.fxCredentials.fullName : '';

                  let orderStoneIds = await this.orderService.getOrderStonesByStoneIds(stoneIds);
                  // IN Future need to remove the code & update status from API
                  if (orderStoneIds.length > 0) {

                    req.stoneIds = orderStoneIds;
                    req.status = StoneStatus.Order.toString();

                    let res = await this.commuteService.updateBulkInventoryItemsForPI(req)
                    if (res && res.length > 0) {
                      let invStatusUpdateRes = await this.inventoryService.updateInventoriesToStockStatus(req.stoneIds, req.status);
                      stoneIds = stoneIds.filter(x => !orderStoneIds.includes(x));
                    }
                  }

                  if (stoneIds.length > 0) {

                    req.stoneIds = stoneIds;
                    req.status = stoneStatus;
                    let res = await this.commuteService.updateBulkInventoryItemsForPI(req)
                    if (res && res.length > 0) {
                      let foStockids = res.map(z => z.stoneId);
                      await this.inventoryService.updateInventoriesToStockStatus(foStockids, stoneStatus);
                    }
                  }

                  this.purchaseTransactionObj.invPurchaseStatus = StoneStatus.Stock.toString();
                }
              }
            }

            if (this.purchaseTransactionObj.transactionDate != null)
              this.purchaseTransactionObj.transactionDate = this.utilityService.setUTCDateFilter(this.purchaseTransactionObj.transactionDate);

            let res = await this.transactionService.update(this.purchaseTransactionObj);
            if (res) {
              this.utilityService.showNotification('Purchase transaction updated successfully! Transactions No: ' + res);
              this.spinnerService.hide();
              this.toggle.emit(false);
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show('Purchase transaction not update, Please try again later!', 'error');
            }
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Purchase transaction not update, Please contact administrator!')
          }
        }
      });
  }
  //#endregion

  //#region OnChange Functions
  public handlePartyFilter(value: any) {
    this.listPartyItems = [];
    let partyItems = this.partyItems.filter(z => z.name.toLowerCase().includes(value.toLowerCase()))
    partyItems.forEach(z => { this.listPartyItems.push({ text: z.name, value: z.id }); });
  }

  public async onPartyChange(e: any, isEdit = false) {
    if (e) {
      let fetchParty = this.partyItems.find(x => x.id == e);
      if (fetchParty) {
        setTimeout(() => {
          this.selectedParty = fetchParty?.name ?? '';
        }, 0);
        this.purchaseTransactionObj.toLedger = fetchParty ?? new LedgerDNorm();

        if (!isEdit) {
          if (this.inventoryExcelItems.length > 0)
            this.inventoryExcelItems = this.inventoryExcelItems.filter(z => z.inWardFlag == null);
          if (this.purchaseTransactionObj.packingList.length > 0) {
            this.purchaseTransactionObj.packingList = this.purchaseTransactionObj.packingList.filter(z => z.isInward == false);
            this.AddItemByPackageList();
          }
        }

      }
      await this.initPartyAdvancePayment();

    }
    else
      this.purchaseTransactionObj.toLedger = new LedgerDNorm();

    this.fillTax();
    if (this.taxTypesZ.length > 0) {
      this.taxTypesZ.forEach(x => {
        if (this.listTax.findIndex(y => y.name == x) >= 0)
          this.listTax[this.listTax.findIndex(y => y.name == x)].isChecked = true;
      })
    }
  }

  public async initPartyAdvancePayment() {
    try {
      this.advancePaymentReceiptTransaction = new Transaction();
      if (this.purchaseTransactionObj.toLedger && this.purchaseTransactionObj.toLedger.id?.length > 0)
        this.advancePaymentReceiptTransaction = await this.transactionService.getAdvancePaymentForPurchase(this.purchaseTransactionObj.toLedger.id);
    } catch (error: any) {
      console.error(error);
    }
  }

  public onTransactItemChange() {
    let fetchDNorm = this.transactItemsDNorm.find(x => x.id == this.selectedTransactItem);
    if (fetchDNorm)
      this.transactionItemObj.item = fetchDNorm ?? new TransactItemDNorm();
    else
      this.transactionItemObj.item = new TransactItemDNorm();
  }

  public async validateEditObj() {
    this.transactionObj.transactionDate = this.getValidDate(this.transactionObj.transactionDate);
    this.onPartyChange(this.transactionObj.toLedger.id, true);
    this.purchaseTransactionObj = this.transactionObj;
    this.invStatus = this.purchaseTransactionObj.invPurchaseStatus;
    this.taxTypesZ = this.purchaseTransactionObj.transactionDetail.taxTypes?.map(x => x.name);
    this.purchaseTotalAmount = this.utilityService.ConvertToFloatWithDecimal(this.purchaseTransactionObj.items.map(z => z.total).reduce((ty, u) => ty + u, 0));
    this.inventoryExcelItems = [];
    this.calculateTransactionItems(true);

    if (this.taxTypesZ.length > 0) {
      this.taxTypesZ.forEach(x => {
        if (this.listTax.findIndex(y => y.name == x) >= 0)
          this.listTax[this.listTax.findIndex(y => y.name == x)].isChecked = true;
      })
    }

    if (this.purchaseTransactionObj.ccAmount != this.purchaseTransactionObj.paidAmount)
      this.initPartyAdvancePayment();

    this.spinnerService.hide();
  }

  public getValidDate(date: any): Date {
    const day = moment(date).date();
    const month = moment(date).month();
    const year = moment(date).year();
    var newDate = new Date(year, month, day);
    return newDate;
  }

  public async getInvDataFromPackageList() {
    try {
      let stoneIds = this.purchaseTransactionObj.packingList.map(z => z.stoneId);
      let res = await this.inventoryService.getInventoryByStoneIds(stoneIds);
      if (res && res.length > 0) {
        this.inventoryExcelItems = [];
        res.forEach(z => {
          let excelItem = this.mappingInventoryItemToExcelItem(z);
          this.inventoryExcelItems.push(excelItem);
        });
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Inventory data not found, Try again later!');
    }
  }

  public async currencyChange() {
    let res = this.accountingconfigService.getFromToCurrencyRate(listCurrencyType.USD.toString(), this.purchaseTransactionObj.transactionDetail.toCurrency, this.accountingConfigData.currencyConfigs);
    this.purchaseTransactionObj.transactionDetail.toCurRate = res.toRate;
    this.calculateCCAmt();
  }

  public calculateCCAmt() {
    this.purchaseTransactionObj.ccAmount = Number((this.purchaseTransactionObj.netTotal * Number(this.purchaseTransactionObj.transactionDetail.toCurRate ?? 0)).toFixed(2)) ?? 0;
  }
  //#endregion

  //#region Modal Changes
  public closPurchaseDialog(): void {
    this.toggleClose.emit(false);
  }

  // Packing list
  public async openPackinglistDialog() {
    this.mySelectionPackage = [];
    this.stoneSearch = '';
    this.certiSearch = '';
    this.isPackinglistDialog = true;
    if (this.isEdit)
      await this.getInvDataFromPackageList();
  }

  public closePackinglistDialog(): void {
    // this.inventoryExcelItems = [];
    // this.purchaseTransactionObj.packingList = [];
    this.isPackinglistDialog = false;
  }
  //#endregion

  //#region Barcode Search
  public onAddStones() {
    try {
      if (this.stoneTxtInput && this.stoneTxtInput.nativeElement) {
        fromEvent(this.stoneTxtInput.nativeElement, 'keyup').pipe(
          map((event: any) => {
            return event.target.value;
          })
          , filter(res => res.length > 2)
          , debounceTime(1500)
        ).subscribe(async (stoneId: string) => {
          if (this.purchaseTransactionObj.toLedger.id == undefined || this.purchaseTransactionObj.toLedger.id == null || this.purchaseTransactionObj.toLedger.id == '') {
            this.utilityService.showNotification('Select Party..!!', 'warning');
            return
          }

          let fetchStoneIds: string[] = this.utilityService.CheckStoneIds(stoneId);
          fetchStoneIds.forEach(z => { z = z.toLowerCase(); });

          //Check if all stone exists in list
          let existsStones = this.inventoryExcelItems.filter(z => fetchStoneIds.includes(z.stoneId.toLowerCase())).map(z => z.stoneId);
          if (existsStones.length == fetchStoneIds.length)
            return;

          this.spinnerService.show();
          let validStoneIds = fetchStoneIds.filter(z => !existsStones.includes(z));
          let res = await this.inwardMemoService.getInwardMemoInvsByStoneIds(validStoneIds, this.purchaseTransactionObj.toLedger.id);
          if (res && res.length > 0) {
            res.forEach(z => {
              let excelItem = this.mappingInventoryItemToExcelItem(z);
              this.inventoryExcelItems.push(excelItem);
            });
          }
          else
            this.alertDialogService.show('No stone(s) found');

          this.spinnerService.hide();
        });
      }

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public onCertificate() {
    try {
      if (this.certificateTxtInput && this.certificateTxtInput.nativeElement) {
        fromEvent(this.certificateTxtInput.nativeElement, 'keyup').pipe(
          map((event: any) => {
            return event.target.value;
          })
          , filter(res => res.length > 4)
          , debounceTime(1500)
        ).subscribe(async (certificateId: string) => {
          if (this.purchaseTransactionObj.toLedger.id == undefined || this.purchaseTransactionObj.toLedger.id == null || this.purchaseTransactionObj.toLedger.id == '') {
            this.utilityService.showNotification('Select Party..!!', 'warning');
            return
          }

          this.spinnerService.show();
          let fetchCertificateIds: string[] = this.utilityService.checkCertificateIds(certificateId);
          fetchCertificateIds.forEach(z => { z = z.toLowerCase(); });

          //Check if all stone exists in list
          let existsCerti = this.inventoryExcelItems.filter(z => fetchCertificateIds.includes(z.certificateNo.toLowerCase())).map(z => z.certificateNo);
          if (existsCerti.length == fetchCertificateIds.length)
            return;

          this.spinnerService.show();
          let validCertificateIds = fetchCertificateIds.filter(z => !existsCerti.includes(z));
          let res = await this.inwardMemoService.getInwardMemoInvsByCertificateIds(validCertificateIds, this.purchaseTransactionObj.toLedger.id);
          if (res && res.length > 0) {
            res.forEach(z => {
              let excelItem = this.mappingInventoryItemToExcelItem(z);
              this.inventoryExcelItems.push(excelItem);
            });
          }
          else
            this.alertDialogService.show('No stone(s) found');

          this.spinnerService.hide();
        });
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public mappingInventoryItemToExcelItem(inv: InventoryItems): InventoryExcelItems {
    let newItem: InventoryExcelItems = new InventoryExcelItems();

    newItem.stoneId = inv.stoneId;
    newItem.kapan = inv.kapan;
    newItem.article = inv.article;
    newItem.shape = inv.shape;
    newItem.weight = Number(inv.weight.toFixed(2));
    newItem.color = inv.color;
    newItem.clarity = inv.clarity;
    newItem.cut = inv.cut;
    newItem.polish = inv.polish;
    newItem.symmetry = inv.symmetry;
    newItem.fluorescence = inv.fluorescence;
    newItem.cps = inv.cps;
    newItem.comments = inv.stoneId;
    newItem.bgmComments = inv.bgmComments;
    newItem.depth = inv.measurement.depth;
    newItem.length = inv.measurement.length;
    newItem.width = inv.measurement.width;
    newItem.height = inv.measurement.height;
    newItem.crownHeight = inv.measurement.crownHeight;
    newItem.crownAngle = inv.measurement.crownAngle;
    newItem.pavilionDepth = inv.measurement.pavilionDepth;
    newItem.pavilionAngle = inv.measurement.pavilionAngle;
    newItem.girdlePer = inv.measurement.girdlePer;
    newItem.ratio = inv.measurement.ratio;
    newItem.minGirdle = inv.measurement.minGirdle;
    newItem.maxGirdle = inv.measurement.maxGirdle;
    newItem.lab = inv.lab?.toUpperCase();
    newItem.certificateNo = inv.certificateNo;
    newItem.certiType = inv.certiType;
    newItem.flColor = inv.inclusion.flColor;
    newItem.ktoS = inv.inclusion.ktoS;
    newItem.inscription = inv.inscription;
    newItem.status = inv.status;
    newItem.orgId = inv.stoneOrg.orgId;
    newItem.orgName = inv.stoneOrg.orgName;
    newItem.deptId = inv.stoneOrg.deptId;
    newItem.deptName = inv.stoneOrg.deptName;
    newItem.branchName = inv.stoneOrg.branchName;
    newItem.country = inv.stoneOrg.country;
    newItem.city = inv.stoneOrg.city;
    newItem.orgCode = inv.stoneOrg.orgCode;
    newItem.empName = inv.identity.name;
    newItem.empId = inv.identity.id;
    newItem.rap = this.isEdit ? this.purchaseTransactionObj.packingList.filter(x => x.stoneId == inv.stoneId)[0].price.rap ?? 0 : inv.price.rap ?? (inv.basePrice.rap ?? 0);
    newItem.discount = this.isEdit ? this.purchaseTransactionObj.packingList.filter(x => x.stoneId == inv.stoneId)[0].price.discount ?? 0 : inv.price.discount ?? (inv.basePrice.discount ?? 0);
    newItem.netAmount = this.isEdit ? this.purchaseTransactionObj.packingList.filter(x => x.stoneId == inv.stoneId)[0].price.netAmount ?? 0 : inv.price.netAmount ?? (inv.basePrice.netAmount ?? 0);
    newItem.perCarat = this.isEdit ? this.purchaseTransactionObj.packingList.filter(x => x.stoneId == inv.stoneId)[0].price.perCarat ?? 0 : inv.price.perCarat ?? (inv.basePrice.perCarat ?? 0);
    newItem.inWardFlag = 'I';

    return newItem;
  }

  public getCommaSapratedString(vals: any[], isAll: boolean = false): string {
    let name = vals.join(',')
    if (!isAll)
      if (name.length > 15)
        name = name.substring(0, 15) + '...';

    return name;
  }
  private getSelectedManualTaxTypeData(): TaxType[] {
    let taxType: TaxType[] = [];
    this.taxTypesZ.forEach(z => {
      var obj = this.allTheTax.find(a => a.name == z);
      if (obj != null)
        taxType.push(obj);
    });
    return taxType;
  }

  public onMultiSelectChange(val: Array<any>, selectedData: string[]): void {
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
    this.calculateTransactionItems();
    this.purchaseTransactionObj.transactionDetail.taxTypes = this.getSelectedManualTaxTypeData();
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

  public fillTax() {
    if (this.allTheTax.length > 0) {
      this.purchaseTransactionObj.transactionDetail.taxTypes = this.getSelectedTaxTypeData();
      this.taxTypesZ = this.purchaseTransactionObj.transactionDetail.taxTypes?.map(x => x.name);

      if (this.taxTypesZ.length > 0) {
        this.taxTypesZ.forEach(x => {
          if (this.listTax.findIndex(y => y.name == x) >= 0)
            this.listTax[this.listTax.findIndex(y => y.name == x)].isChecked = true;
        });
      }

      if (!this.transactionObj.id)
        this.calculateTransactionItems();
    }
  }

  private getSelectedTaxTypeData(): TaxType[] {
    let taxType: TaxType[] = new Array<TaxType>();
    let initTax: TaxType[] = [];
    if (this.purchaseTransactionObj.toLedger.address.country?.toLowerCase() == 'india' && this.purchaseTransactionObj.fromLedger.address.country?.toLowerCase() == 'india') {
      if (this.purchaseTransactionObj.toLedger.address.state?.toLowerCase() == this.purchaseTransactionObj.fromLedger.address.state?.toLowerCase())
        initTax = this.allTheTax.filter(a => a.name?.toLowerCase() == 'cgst' || a.name?.toLowerCase() == 'sgst');
      else
        initTax = this.allTheTax.filter(a => a.name?.toLowerCase() == 'igst');
    }

    if (initTax.length > 0)
      taxType = initTax;

    return taxType;
  }
  //#endregion

}
