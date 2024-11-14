import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, orderBy, process, SortDescriptor } from '@progress/kendo-data-query';
import { environment } from 'environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { ComponentCanDeactivate } from 'shared/auth';
import { fxCredential, SystemUserPermission } from 'shared/enitites';
import { StockTallyRemainRFIDFormat, StockTallyRFIDFormat, StoneStatus, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { InventorySearchCriteria, StockTallyDate, StockTallyItems } from '../../../businessobjects';
import { RFIDClass, StockTally, StockTallyBox, StockTallyHistory } from '../../../entities';
import { StocktallyService } from '../../../services';
declare var Spacecode: any;

@Component({
  selector: 'app-rfidstocktally',
  templateUrl: './rfidstocktally.component.html',
  styleUrls: ['./rfidstocktally.component.css']
})
export class RfidstocktallyComponent implements OnInit, ComponentCanDeactivate, OnDestroy {

  // RFID doc spacecode
  // https://www.spacecode.com/HtmlDoc/docs/jsdoc/
  public fxCredential?: fxCredential;
  public device: any;
  // Local
  // public scannedTags: string[] = ["100734966959", "100743533012", "100739418781", "100743079092", "100737800993", "100720566482", "100743158354", "100747797482", "100747807638", "100721142928", "100742368816", "100741276680", "123569854"];
  // Glowstar
  // public scannedTags: string[] = ["100741456247", "100727798481", "100738840165", "10073884016562"];
  // Diamart HK
  // public scannedTags: string[] = ["100747341507", "100747360357", "100738840165"];
  // Sarju
  // public scannedTags: string[] = ["100735824744", "100747845064", "100738840165435", "10073884016562","100746698077"];
  public scannedTags: string[] = [];
  public statusText: string = "ERROR";
  public statusTextBgClass: string = "bg-danger";
  public foundTags: any[] = [];
  public filterFoundTags!: DataResult;
  public notFoundTags: any[] = [];
  public filterNotFoundTags!: DataResult;
  public notAllocatedTags: any[] = [];
  public filterNotAllocatedTags!: DataResult;
  public isScanCompleted: boolean = false;
  public isAllNotFoundLighting: boolean = false;
  public isAllFoundLighting: boolean = false;
  public isAllNotAllocatedLighting: boolean = false;
  public foundSkip = 0;
  public notFoundSkip = 0;
  public notAllocatedSkip = 0;
  public rfIdGridPageSize = 10;
  public tagArr: any = [];
  public inventorySearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };

  public stockTallyList: StockTally[] = new Array<StockTally>();
  public cloneStockTallyList: StockTally[] = new Array<StockTally>();
  public totalWeight: number = 0;
  public totalPcs: number = 0;
  public totalStockDiffrencePcs: number = 0;
  public totalStockDiffrenceWeight: number = 0;
  public totalPDdiffrencePcs: number = 0;
  public totalPDDiffrenceWeight: number = 0;
  public totalMemoPcs: number = 0;
  public totalMemoWeight: number = 0;
  public totalTransitPcs: number = 0;
  public totalTransitWeight: number = 0;
  public totalLabReturnPcs: number = 0;
  public totalLabReturnWeight: number = 0;
  public totalStockOnHandPcs: number = 0;
  public totalStockOnHandWeight: number = 0;
  public totalOrderDeliveryPcs: number = 0;
  public totalOrderDeliveryWeight: number = 0;
  public totalSoldDeliveryPcs: number = 0;
  public totalSoldDeliveryWeight: number = 0;
  public isViewRFIDModal: boolean = false;

  public isViewButtons: boolean = false;
  public isCanAccessAllButtons: boolean = false;
  public timer: any;
  public deliveryPendingStoneList: Array<string> = Array<string>();
  public listDateItems: Array<StockTallyDate> = new Array<StockTallyDate>();
  public listDateStringItems: Array<string> = new Array<string>();
  public showDate!: string
  public selectedDate!: string;
  public isSearch: boolean = false;
  public sort!: SortDescriptor[];
  public selectableSettings: SelectableSettings = {
    mode: 'multiple',
    checkboxOnly: true
  };
  public myFoundSelection: Array<string> = new Array<string>();
  public myNotFoundSelection: Array<string> = new Array<string>();
  public myNotAllocatedSelection: Array<string> = new Array<string>();
  public isShowCheckBoxAll: boolean = true;
  public isStockTallyBox: boolean = false;
  public isStockTallyItems: boolean = false;
  public stockTallyBoxNo!: number;
  public stockTallyItemsList: StockTallyItems[] = new Array<StockTallyItems>();



  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean | any {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
  }

  constructor(
    private router: Router,
    private stockTallyService: StocktallyService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
  ) {
  }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    let deviceUrl: string = '';
    this.fxCredential = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    await this.setUserRights();

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin'))
      this.isCanAccessAllButtons = true;
    this.inventorySearchCriteriaObj.organizationId = this.fxCredential.organizationId;
    if (environment.production)
      deviceUrl = "ws://" + this.fxCredential.deviceRFIDUrl;
    else
      deviceUrl = "ws://" + this.fxCredential.deviceRFIDUrl;

    this.device = new Spacecode.Device(deviceUrl);
    this.loadSpaceCodeScan();
    await this.loadStockTallyAsync();
    await this.loadDateStockTallyHistory();
    await this.loadStockTallyItems();
  }

  // /* #region  RFID machine methods */
  public loadSpaceCodeScan() {
    try {
      // var device = new Device("192.168.1k.20");
      this.getRFIDStatus(this.device._status);
      let that = this;
      this.device.connect();

      this.device.on('connected', function () {
        that.getRFIDStatus(that.device.getStatus());
      });

      this.device.on('disconnected', function () {
        that.getRFIDStatus(that.device.getStatus());
      });

      this.device.on('scanstarted', function () {
        that.spinnerService.show()
        that.getRFIDStatus(that.device.getStatus());
      });

      this.device.on('tagadded', function (tagUid: any) {
        let index = that.scannedTags.findIndex(x => x == tagUid);
        if (index < 0)
          that.scannedTags.push(tagUid);
      });

      this.device.on('scancompleted', async function () {
        that.spinnerService.hide();

        if (!that.isScanCompleted) {
          that.getRFIDStatus(that.device.getStatus());
          that.isScanCompleted = true;
        }

        //#region scan code old
        if (that.scannedTags.length > 0) {
          that.spinnerService.show();
          that.cleanScan();

          let scanInventories: StockTallyItems[] = await that.stockTallyService.getStockTallyItemsByRFIDs(that.scannedTags);

          if (scanInventories && scanInventories.length > 0) {
            for (let index = 0; index < that.scannedTags.length; index++) {
              const element = that.scannedTags[index];

              let findingRFID: StockTallyItems = scanInventories.find((x: StockTallyItems) => x.rfid == element) ?? new StockTallyItems();
              if (findingRFID.invId) {
                let foundDeliveryPendingStone = that.deliveryPendingStoneList.some(x => x.toLowerCase() == findingRFID.stoneId.toLowerCase())
                if (foundDeliveryPendingStone) {
                  that.foundTags.push(findingRFID);
                } else {
                  if (findingRFID.isMemo == false && findingRFID.isLabReturn == true && findingRFID.status != StoneStatus.Transit.toString())
                    that.foundTags.push(findingRFID);
                  else
                    that.notFoundTags.push(findingRFID);
                }
              }
              else {
                let obj = { rfid: element, isLighting: false };
                that.notAllocatedTags.push(obj);
              }
            }

            that.foundTags = orderBy(that.foundTags, [{ field: "status", dir: "asc" }]);
            that.foundTags = that.foundTags.map((str: any) => ({ stoneId: str.stoneId, rfid: str.rfid, kapan: str.kapan, weight: str.weight, isLighting: false, status: str.status }));
            that.notFoundTags = that.notFoundTags.map((str: any) => ({ stoneId: str.stoneId, rfid: str.rfid, status: str.status, isLabReturn: str.isLabReturn, isHold: str.isHold, isMemo: str.isMemo, isLighting: false }));
            that.notAllocatedTags = that.notAllocatedTags.map((str: any) => ({ rfid: str.rfid, isLighting: false }));

            //Init Filter data in RFId Grids
            let event: any = { skip: 0 };
            that.foundTags = that.foundTags.filter((v, i, a) => a.findIndex(v2 => (v2.rfid === v.rfid)) === i);
            that.filterFoundTags = that.rfIdGridPageChange(event, that.foundTags);
            that.filterNotFoundTags = that.rfIdGridPageChange(event, that.notFoundTags);
            that.filterNotAllocatedTags = that.rfIdGridPageChange(event, that.notAllocatedTags);

            let foundStockErrorFlag = that.foundTags.every(x => x.status == StoneStatus.Stock.toString());
            let foundPendingErrorFlag = that.foundTags.every(x => (x.status == StoneStatus.Order.toString() || x.status == StoneStatus.Sold.toString()));

            if (!foundStockErrorFlag && !foundPendingErrorFlag)
              that.alertDialogService.show("Stock and Pending Delivery Stones found in Found stones box.Please Try Again!!");
          }
          that.spinnerService.hide();

        }
        //#endregion
      });

      this.routerOnActivate();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      // this.alertDialogService.show(error.error)
    }
  }

  public async loadDateStockTallyHistory() {
    try {

      this.listDateItems = await this.stockTallyService.getExistDateHistoryStockTally() ?? new Array<StockTallyDate>();
      if (this.listDateItems) {
        this.listDateStringItems = new Array<string>();
        this.listDateStringItems = this.listDateItems.map(x => x.stockTallyNo + ' - ' + new Date(x.stockTallyDateValue).toLocaleDateString('en-GB'))
      }
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public async loadStockTallyItems() {
    try {

      this.stockTallyItemsList = await this.stockTallyService.GetAllStockTallyItems() ?? new Array<StockTallyItems>();

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public async setUserRights() {
    let userPermissions: SystemUserPermission = new SystemUserPermission();
    let sesValue = sessionStorage.getItem("userPermission");
    if (sesValue)
      userPermissions = JSON.parse(sesValue) as SystemUserPermission;
    if (userPermissions.actions.length > 0) {
      let CanDeleteLedger = userPermissions.actions.find(z => z.name == "CanAccessStockTallyButtons");
      if (CanDeleteLedger != null)
        this.isCanAccessAllButtons = true;
    }
  }

  public getRFIDStatus(status: string) {
    status = status.toUpperCase();
    this.statusText = status;
    if (status == "NOT_READY" || status == "ERROR")
      this.statusTextBgClass = "bg-danger";
    else if (status == "READY")
      this.statusTextBgClass = "bg-success";
    else if (status == "SCANNING")
      this.statusTextBgClass = "bg-info";
    else if (status == "LIGHTING")
      this.statusTextBgClass = "bg-warning";

  }

  public routerOnActivate() {
    let that = this;
    this.timer = setInterval(() => {
      that.getRFIDStatus(that.device.getStatus());
    }, 5000);
  }

  public routerOnDeactivate() {
    clearInterval(this.timer);
  }

  public async startScan() {
    try {
      this.spinnerService.show();
      this.cleanScan();
      this.scannedTags = [];

      this.isScanCompleted = false;
      if (this.device.getStatus().toUpperCase() == "READY")
        this.device.requestScan();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public refreshDevice() {
    this.spinnerService.show();
    if (!this.device.isConnected()) {
      this.device.connect();
      this.spinnerService.hide();

    }
    this.scannedTags = [];

    this.cleanScan()
    this.getRFIDStatus(this.device.getStatus());
    this.spinnerService.hide();

  }

  public startLighting(id: any, index: number, type: string) {
    try {
      this.spinnerService.show();
      let event: any = { skip: 0 };

      if (type.toLowerCase() == 'notfound') {
        this.notFoundTags[index].isLighting = !this.notFoundTags[index].isLighting

        let notFoundAllLight = this.notFoundTags.every(x => x.isLighting);
        if (notFoundAllLight)
          this.isAllNotFoundLighting = true
        else
          this.isAllNotFoundLighting = false

        this.filterNotFoundTags = this.rfIdGridPageChange(event, this.notFoundTags);
      }
      if (type.toLowerCase() == 'found') {
        this.foundTags[index].isLighting = !this.foundTags[index].isLighting

        let foundAllLight = this.foundTags.every(x => x.isLighting);
        if (foundAllLight)
          this.isAllFoundLighting = true
        else
          this.isAllFoundLighting = false

        this.filterFoundTags = this.rfIdGridPageChange(event, this.foundTags);
      }

      if (type.toLowerCase() == 'notallocated') {
        this.notAllocatedTags[index].isLighting = !this.notAllocatedTags[index].isLighting

        let notAllocatedAllLight = this.notAllocatedTags.every(x => x.isLighting);
        if (notAllocatedAllLight)
          this.isAllNotAllocatedLighting = true
        else
          this.isAllNotAllocatedLighting = false

        this.filterNotAllocatedTags = this.rfIdGridPageChange(event, this.notAllocatedTags);
      }


      let findLightIndex = this.tagArr.findIndex((x: any) => x == id.rfid);
      if (findLightIndex >= 0)
        this.tagArr.splice(findLightIndex, 1)
      else
        this.tagArr.push(id.rfid);

      this.stopLighting(false);

      if (this.tagArr && this.tagArr.length > 0)
        this.subMethodLighting()
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show("Something went wrong, Please try again later");
    }
  }

  public startAllLighting(type: string) {
    try {
      let event: any = { skip: 0 };
      if (type.toLowerCase() == 'notfound') {
        let notallocated = this.notFoundTags.map(x => x.rfid);
        if (!this.isAllNotFoundLighting) {
          this.notFoundTags.map(x => x.isLighting = true);
          this.tagArr.push(...notallocated)
        }
        else {
          this.notFoundTags.map(x => x.isLighting = false);
          this.tagArr = this.tagArr.filter((val: any) => !notallocated.includes(val));
        }
        this.isAllNotFoundLighting = !this.isAllNotFoundLighting
        this.filterNotFoundTags = this.rfIdGridPageChange(event, this.notFoundTags);
      }

      if (type.toLowerCase() == 'found') {
        let foundrfid = this.foundTags.map(x => x.rfid);
        if (!this.isAllFoundLighting) {
          this.foundTags.map(x => x.isLighting = true);
          this.tagArr.push(...foundrfid)
        }
        else {
          this.foundTags.map(x => x.isLighting = false);
          this.tagArr = this.tagArr.filter((val: any) => !foundrfid.includes(val));
        }
        this.isAllFoundLighting = !this.isAllFoundLighting;
        this.filterFoundTags = this.rfIdGridPageChange(event, this.foundTags);

      }

      if (type.toLowerCase() == 'notallocated') {
        let notallocatedrfid = this.notAllocatedTags.map(x => x.rfid);
        if (!this.isAllNotAllocatedLighting) {
          this.notAllocatedTags.map(x => x.isLighting = true);
          this.tagArr.push(...notallocatedrfid)
        }
        else {
          this.notAllocatedTags.map(x => x.isLighting = false);
          this.tagArr = this.tagArr.filter((val: any) => !notallocatedrfid.includes(val));
        }
        this.isAllNotAllocatedLighting = !this.isAllNotAllocatedLighting;
        this.filterNotAllocatedTags = this.rfIdGridPageChange(event, this.notAllocatedTags);

      }

      let that = this;
      this.tagArr = this.tagArr.filter(function (item: any, pos: any) {
        return that.tagArr.indexOf(item) == pos;
      });

      this.stopLighting(false);
      if (this.tagArr && this.tagArr.length > 0)
        this.subMethodLighting()

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show("Something went wrong, Please try again later");
    }
  }

  public subMethodLighting() {
    try {
      this.spinnerService.show();
      this.device.startLightingTagsLed(null, this.tagArr);
      this.device.setLightIntensity(null, 300)
      let that = this;


      this.device.on('lightingstarted', function (tagsNotLighted: any) {
        that.getRFIDStatus(that.device.getStatus());
        that.spinnerService.hide();

      });
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show("Something went wrong, Please try again later");
    }


  }

  public stopLighting(isAllRemove: boolean = true) {
    try {
      this.spinnerService.show();
      this.device.stopLightingTagsLed();
      let that = this;
      this.device.on('lightingstopped', function () {
        that.getRFIDStatus(that.device.getStatus());
        if (isAllRemove) {
          that.isAllFoundLighting = false;
          that.isAllNotFoundLighting = false;
          that.isAllNotAllocatedLighting = false;
          if (that.foundTags && that.foundTags.length > 0)
            for (let index = 0; index < that.foundTags.length; index++) {
              const element = that.foundTags[index];
              element.isLighting = false;
            }

          if (that.notFoundTags && that.notFoundTags.length > 0)
            for (let index = 0; index < that.notFoundTags.length; index++) {
              const element = that.notFoundTags[index];
              element.isLighting = false;
            }

          if (that.notAllocatedTags && that.notAllocatedTags.length > 0)
            for (let index = 0; index < that.notAllocatedTags.length; index++) {
              const element = that.notAllocatedTags[index];
              element.isLighting = false;
            }
        }
        that.spinnerService.hide();

      });
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show("Something went wrong, Please try again later");
    }


  }
  /* #endregion */

  /* #region Scanned Rfid Pagination */
  public rfIdGridPageChange(event: PageChangeEvent, data: any[]): DataResult {
    let skip = event.skip;
    let allData = JSON.parse(JSON.stringify(data));
    if (this.sort && this.sort.length > 0)
      allData = orderBy(allData, this.sort)
    let filterData = allData.slice(skip, skip + this.rfIdGridPageSize);
    let dataResult: DataResult = process(filterData, { group: [] });
    dataResult.total = allData.length;
    return dataResult;
  }
  /* #endregion */

  /* #region  List StockTally */
  public async loadStockTallyAsync() {
    try {
      this.spinnerService.show();
      this.stockTallyList = await this.stockTallyService.GetAllStockTallyAsync();
      this.stockTallyList = this.stockTallyList.filter(x => {

        x.stockDiffrenceCount = (x.count - (x.memoCount ?? 0) - (x.labReturnCount ?? 0) - (x.deliveryOrderCount ?? 0) - (x.deliverySoldCount ?? 0) - (x.transitCount ?? 0) - (x.stockOnHandCount ?? 0) ?? 0);
        x.stockDiffrenceWeight = this.utilityService.ConvertToFloatWithDecimal(this.utilityService.ConvertToFloatWithDecimal(x.weight) - this.utilityService.ConvertToFloatWithDecimal(x.memoWeight ?? 0) - this.utilityService.ConvertToFloatWithDecimal(x.labReturnWeight ?? 0) - this.utilityService.ConvertToFloatWithDecimal(x.deliveryOrderWeight ?? 0) - this.utilityService.ConvertToFloatWithDecimal(x.deliverySoldWeight ?? 0) - this.utilityService.ConvertToFloatWithDecimal(x.transitWeight ?? 0) - this.utilityService.ConvertToFloatWithDecimal(x.stockOnHandWeight ?? 0));
        return x;
      })

      this.cloneStockTallyList = JSON.parse(JSON.stringify(this.stockTallyList))
      let orderPendingAll = this.stockTallyList.map(x => x.deliveryOrderList.length > 0 ? x.deliveryOrderList.map(y => y.stoneId) : []);
      let soldPendingAll = this.stockTallyList.map(x => x.deliverySoldList.length > 0 ? x.deliverySoldList.map(y => y.stoneId) : []);
      let remainDeliveryPendingAll = [...orderPendingAll, ...soldPendingAll];

      this.deliveryPendingStoneList = Array<string>();
      for (let index = 0; index < remainDeliveryPendingAll.length; index++) {
        const element = remainDeliveryPendingAll[index];
        this.deliveryPendingStoneList.push(...[...element]);
      }

      this.loadCalCulateTotal();
      this.excelData = this.excelData.bind(this);

      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public loadCalCulateTotal() {
    this.totalWeight = this.stockTallyList.reduce((acc, cur) => acc + cur.weight, 0);
    this.totalPcs = this.stockTallyList.reduce((acc, cur) => acc + cur.count, 0);
    this.totalStockDiffrencePcs = this.stockTallyList.reduce((acc, cur) => acc + cur.stockDiffrenceCount, 0);
    this.totalStockDiffrenceWeight = this.stockTallyList.reduce((acc, cur) => acc + cur.stockDiffrenceWeight, 0);
    this.totalPDdiffrencePcs = this.stockTallyList.reduce((acc, cur) => acc + cur.pdDiffrenceCount, 0);
    this.totalPDDiffrenceWeight = this.stockTallyList.reduce((acc, cur) => acc + cur.pdDiffrenceWeight, 0);
    this.totalMemoPcs = this.stockTallyList.reduce((acc, cur) => acc + cur.memoCount, 0);
    this.totalMemoWeight = this.stockTallyList.reduce((acc, cur) => acc + cur.memoWeight, 0);
    this.totalTransitPcs = this.stockTallyList.reduce((acc, cur) => acc + cur.transitCount, 0);
    this.totalTransitWeight = this.stockTallyList.reduce((acc, cur) => acc + cur.transitWeight, 0);
    this.totalLabReturnPcs = this.stockTallyList.reduce((acc, cur) => acc + cur.labReturnCount, 0);
    this.totalLabReturnWeight = this.stockTallyList.reduce((acc, cur) => acc + cur.labReturnWeight, 0);
    this.totalStockOnHandPcs = this.stockTallyList.reduce((acc, cur) => acc + cur.stockOnHandCount, 0);
    this.totalStockOnHandWeight = this.stockTallyList.reduce((acc, cur) => acc + cur.stockOnHandWeight, 0);
    this.totalOrderDeliveryPcs = this.stockTallyList.reduce((acc, cur) => acc + cur.deliveryOrderCount, 0);
    this.totalOrderDeliveryWeight = this.stockTallyList.reduce((acc, cur) => acc + cur.deliveryOrderWeight, 0);
    this.totalSoldDeliveryPcs = this.stockTallyList.reduce((acc, cur) => acc + cur.deliverySoldCount, 0);
    this.totalSoldDeliveryWeight = this.stockTallyList.reduce((acc, cur) => acc + cur.deliverySoldWeight, 0);
  }
  /* #endregion */

  /* #region Submit Section for StockTally  */
  public onRFIDStockTallySubmit() {
    let that = this;
    let foundStockErrorFlag = that.foundTags.every(x => x.status == StoneStatus.Stock.toString());
    let foundPendingErrorFlag = that.foundTags.every(x => (x.status == StoneStatus.Order.toString() || x.status == StoneStatus.Sold.toString()));
    if (!foundPendingErrorFlag && !foundStockErrorFlag)
      return this.alertDialogService.show("Stock and Pending Delivery Stones found in Found stones box.Please Try Again!!");

    if (that.notFoundTags.length > 0 || this.notAllocatedTags.length > 0)
      return this.alertDialogService.show("Please Clear Not Found Stones  or Not Allocated Stones.Please Try Again!!");

    this.alertDialogService.ConfirmYesNo("Are you sure you want to tally selected stone(s)?", "Stock Tally")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            let rfidList = new Array<RFIDClass>();
            for (let index = 0; index < that.foundTags.length; index++) {
              const element = that.foundTags[index];

              if (this.stockTallyList && this.stockTallyList.length > 0) {

                let sIndex = this.stockTallyList.findIndex(x => x.kapan == element.kapan);
                if (sIndex > -1) {

                  if (this.stockTallyList[sIndex].stockDiffrenceList && this.stockTallyList[sIndex].stockDiffrenceList.length > 0) {

                    let diffStoneIndex = this.stockTallyList[sIndex].stockDiffrenceList.findIndex(x => x.stoneId.toLowerCase() == element.stoneId.toLowerCase())
                    if (diffStoneIndex > -1) {

                      this.stockTallyList[sIndex].stockOnHandCount += 1;
                      this.stockTallyList[sIndex].stockOnHandWeight += Number(element.weight.toFixed(2));
                      this.stockTallyList[sIndex].stockOnHandWeight = Number(this.stockTallyList[sIndex].stockOnHandWeight.toFixed(2));
                      this.stockTallyList[sIndex].stockDiffrenceList.splice(diffStoneIndex, 1);
                      this.stockTallyList[sIndex].stockOnHandList.push({ rfid: element.rfid, stoneId: element.stoneId, weight: element.weight, status: element.status });
                    }
                  }

                  if (this.stockTallyList[sIndex].pdDiffrenceList && this.stockTallyList[sIndex].pdDiffrenceList.length > 0) {

                    let diffPdIndex = this.stockTallyList[sIndex].pdDiffrenceList.findIndex(x => x.stoneId.toLowerCase() == element.stoneId.toLowerCase())
                    if (diffPdIndex > -1) {

                      this.stockTallyList[sIndex].pdDiffrenceList.splice(diffPdIndex, 1);
                      this.stockTallyList[sIndex].pdDiffrenceWeight -= Number(element.weight.toFixed(2));
                      this.stockTallyList[sIndex].pdDiffrenceWeight = Number(this.stockTallyList[sIndex].pdDiffrenceWeight.toFixed(2));
                      this.stockTallyList[sIndex].pdDiffrenceCount -= 1;
                    }
                  }

                  if (this.stockTallyItemsList && this.stockTallyItemsList.length > 0) {
                    let talliedIndex = this.stockTallyItemsList.findIndex(a => a.stoneId == element.stoneId);
                    if (talliedIndex >= 0)
                      this.stockTallyItemsList[talliedIndex].isTally = true;
                  }
                }
              }

              let rfidObj = new RFIDClass();
              rfidObj.rfid = element.rfid;
              rfidObj.stoneId = element.stoneId;
              rfidObj.weight = element.weight;
              rfidObj.status = element.status;

              rfidList.push(rfidObj);

            }

            this.stockTallyList = this.stockTallyList.filter(x => {

              x.stockDiffrenceCount = (x.count - (x.memoCount ?? 0) - (x.labReturnCount ?? 0) - (x.deliveryOrderCount ?? 0) - (x.deliverySoldCount ?? 0) - (x.transitCount ?? 0) - (x.stockOnHandCount ?? 0) ?? 0);
              x.stockDiffrenceWeight = this.utilityService.ConvertToFloatWithDecimal(this.utilityService.ConvertToFloatWithDecimal(x.weight) - this.utilityService.ConvertToFloatWithDecimal(x.memoWeight ?? 0) - this.utilityService.ConvertToFloatWithDecimal(x.labReturnWeight ?? 0) - this.utilityService.ConvertToFloatWithDecimal(x.deliveryOrderWeight ?? 0) - this.utilityService.ConvertToFloatWithDecimal(x.deliverySoldWeight ?? 0) - this.utilityService.ConvertToFloatWithDecimal(x.transitWeight ?? 0) - this.utilityService.ConvertToFloatWithDecimal(x.stockOnHandWeight ?? 0));
              return x;
            });

            if (rfidList && rfidList.length > 0) {
              let stockTallyBoxReq = new StockTallyBox();
              stockTallyBoxReq.stockTallyBoxNo = this.stockTallyBoxNo ? this.stockTallyBoxNo : 0;
              stockTallyBoxReq.stockTallyBoxList = rfidList;

              await this.stockTallyService.addStockTallyBox(stockTallyBoxReq);
              this.stockTallyBoxNo = null as any;
            }

            this.loadCalCulateTotal();
            this.excelData = this.excelData.bind(this);
            this.cleanScan();
            this.scannedTags = [];
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show(error.error);
          }
        }
      });
  }
  /* #endregion */

  /* #region Export Remain stock section  */
  public exportToExcel() {
    try {
      this.spinnerService.show();

      let excelFile = [];
      let remainTallyStoneAll = this.stockTallyList.map(x => x.stockDiffrenceList.filter(a => a.status != StoneStatus.Repair.toString()).map(y => y.stoneId));
      let repairStoneAll = this.stockTallyList.map(x => x.stockDiffrenceList.filter(a => a.status == StoneStatus.Repair.toString()).map(y => y.stoneId));
      let memoStoneAll = this.cloneStockTallyList.map(x => x.memoList.map(y => y.stoneId));
      let labStoneAll = this.cloneStockTallyList.map(x => x.labReturnList.map(y => y.stoneId));
      let transitStoneAll = this.cloneStockTallyList.map(x => x.transitList.map(y => y.stoneId));
      let orderPendingStoneAll = this.stockTallyList.map(x => x.pdDiffrenceList.filter(a => a.status == StoneStatus.Order.toString()).map(y => y.stoneId));
      let soldPendingStoneAll = this.stockTallyList.map(x => x.pdDiffrenceList.filter(a => a.status == StoneStatus.Sold.toString()).map(y => y.stoneId));
      let talliedStockAll = this.stockTallyList.map(x => x.stockOnHandList.map(y => y.stoneId));

      let finalRemainStoneList: Array<string> = new Array<string>();
      if (remainTallyStoneAll && remainTallyStoneAll.length > 0)
        remainTallyStoneAll.forEach(element => finalRemainStoneList.push(...[...element]));

      let finalRepairStoneList: Array<string> = new Array<string>();
      if (repairStoneAll && repairStoneAll.length > 0)
        repairStoneAll.forEach(element => finalRepairStoneList.push(...[...element]));

      let finalMemoStoneList: Array<string> = new Array<string>();
      if (memoStoneAll && memoStoneAll.length > 0)
        memoStoneAll.forEach(element => finalMemoStoneList.push(...[...element]));

      let finalLabStoneList: Array<string> = new Array<string>();
      if (labStoneAll && labStoneAll.length > 0)
        labStoneAll.forEach(element => finalLabStoneList.push(...[...element]));

      let finalTransitStoneList: Array<string> = new Array<string>();
      if (transitStoneAll && transitStoneAll.length > 0)
        transitStoneAll.forEach(element => finalTransitStoneList.push(...[...element]));

      let finalOrderStoneList: Array<string> = new Array<string>();
      if (orderPendingStoneAll && orderPendingStoneAll.length > 0)
        orderPendingStoneAll.forEach(element => finalOrderStoneList.push(...[...element]));

      let finalSoldStoneList: Array<string> = new Array<string>();
      if (soldPendingStoneAll && soldPendingStoneAll.length > 0)
        soldPendingStoneAll.forEach(element => finalSoldStoneList.push(...[...element]));

      let finalTalliedStockList: Array<string> = new Array<string>();
      if (talliedStockAll && talliedStockAll.length > 0)
        talliedStockAll.forEach(element => finalTalliedStockList.push(...[...element]));


      let lengthArray = [finalRemainStoneList.length, finalMemoStoneList.length, finalLabStoneList.length, finalTransitStoneList.length, finalOrderStoneList.length, finalSoldStoneList.length, finalTalliedStockList.length];
      let length = (Math.max(...lengthArray)) ?? 0;
      if (length == undefined || length == null || length <= 0)
        return this.alertDialogService.show("There is no stone to export!");

      for (let index = 0; index < length; index++) {
        let remainStockElement = finalRemainStoneList[index] != null ? finalRemainStoneList[index] : "";
        let memoElement = finalMemoStoneList[index] != null ? finalMemoStoneList[index] : "";
        let labElement = finalLabStoneList[index] != null ? finalLabStoneList[index] : "";
        let transitElement = finalTransitStoneList[index] != null ? finalTransitStoneList[index] : "";
        let orderPendingElement = finalOrderStoneList[index] != null ? finalOrderStoneList[index] : "";
        let soldPendingElement = finalSoldStoneList[index] != null ? finalSoldStoneList[index] : "";
        let talliedStockElement = finalTalliedStockList[index] != null ? finalTalliedStockList[index] : "";
        let repairElement = finalRepairStoneList[index] != null ? finalRepairStoneList[index] : "";

        var excel = this.convertRemainArrayToObjectExcel(StockTallyRemainRFIDFormat, remainStockElement, memoElement, labElement, transitElement, orderPendingElement, soldPendingElement, repairElement, talliedStockElement);
        excelFile.push(excel);
      }

      if (excelFile.length > 0)
        this.utilityService.exportAsExcelFile(excelFile, "RemainStone_Excel");

      this.spinnerService.hide();

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show("Something went wrong while exporting excel, contact administrator!!");
    }

  }

  public convertRemainArrayToObjectExcel(fields: Array<string>, remainStockElement: string, memoElement: string, labElement: string, transitElement: string, orderPendingElement: string, soldPendingElement: string, repairElement: string, talliedStockElement: string) {

    var obj: any = {};
    for (let i = 0; i < fields.length; i++) {
      if (remainStockElement != "") {
        if (fields[i] == "Remain Stone") {
          obj[fields[i]] = remainStockElement;
        }
      }
      if (memoElement != "") {
        if (fields[i] == "Memo Stone") {
          obj[fields[i]] = memoElement;
        }
      }

      if (labElement != "") {
        if (fields[i] == "Lab Stone") {
          obj[fields[i]] = labElement;
        }
      }

      if (transitElement != "") {
        if (fields[i] == "Transit Stone") {
          obj[fields[i]] = transitElement;
        }
      }

      if (orderPendingElement != "") {
        if (fields[i] == "Order DP Stone") {
          obj[fields[i]] = orderPendingElement;
        }
      }

      if (soldPendingElement != "") {
        if (fields[i] == "Sold DP Stone") {
          obj[fields[i]] = soldPendingElement;
        }
      }

      if (repairElement != "") {
        if (fields[i] == "Repair Stone") {
          obj[fields[i]] = repairElement;
        }
      }

      if (talliedStockElement != "") {
        if (fields[i] == "Tallied Stone") {
          obj[fields[i]] = talliedStockElement;
        }
      }
    }
    return obj;
  }

  public exportScannedGrid() {
    let excelFile = [];
    let deliveryFoundTags = [];
    let stockFoundTags = [];
    if (this.foundTags && this.foundTags.length > 0) {
      stockFoundTags = this.foundTags.filter(x => x.status == StoneStatus.Stock.toString());
      deliveryFoundTags = this.foundTags.filter(x => x.status == StoneStatus.Order.toString() || x.status == StoneStatus.Sold.toString());
    }
    let lengthArray = [(stockFoundTags.length ?? 0), (deliveryFoundTags.length ?? 0), this.notFoundTags.length, this.notAllocatedTags.length];
    let length = (Math.max(...lengthArray)) ?? 0;
    if (length == undefined || length == null || length <= 0)
      return this.alertDialogService.show("There is no stone to export!");

    for (let index = 0; index < length; index++) {
      let stockFoundElement = stockFoundTags[index] != null ? stockFoundTags[index] : null;
      let deliveryFoundElement = deliveryFoundTags[index] != null ? deliveryFoundTags[index] : null;
      let notFoundElement = this.notFoundTags[index] != null ? this.notFoundTags[index] : null;
      let notAllocatedElement = this.notAllocatedTags[index] != null ? this.notAllocatedTags[index] : null;

      var excel = this.convertArrayToObjectExcel(StockTallyRFIDFormat, stockFoundElement, deliveryFoundElement, notFoundElement, notAllocatedElement);
      excelFile.push(excel);
    }

    if (excelFile.length > 0)
      this.utilityService.exportAsExcelFile(excelFile, "StockTally_Scanned_Excel");
  }

  public convertArrayToObjectExcel(fields: Array<string>, stockFoundElement: any, deliveryFoundElement: any, notFoundElement: any, notAllocatedElement: any): any {
    var obj: any = {};
    for (let i = 0; i < fields.length; i++) {
      if (stockFoundElement != null) {
        if (fields[i] == "Stock Found Stone") {
          obj[fields[i]] = stockFoundElement.stoneId;
        }
      }

      if (deliveryFoundElement != null) {
        if (fields[i] == "Delivery Found Stone") {
          obj[fields[i]] = deliveryFoundElement.stoneId;
        }
      }

      if (notFoundElement != null) {
        if (fields[i] == "Not Found Stone") {
          if (notFoundElement.stoneId)
            obj[fields[i]] = notFoundElement.stoneId;
          else
            obj[fields[i]] = notFoundElement.rfid;
        }
      }
      if (notAllocatedElement != null) {
        if (fields[i] == "Not Allocated")
          obj[fields[i]] = notAllocatedElement.rfid;

      }
    }
    return obj;
  }
  /* #endregion */

  public toggleRFIDScanDialog() {
    this.cleanScan();
    this.isViewRFIDModal = !this.isViewRFIDModal;
  }

  public toggleStockTallyLoadDialog() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to Re-load StockTally?", "StockTally")
        .subscribe(async (res: any) => {
          if (res.flag)
            await this.loadStockTallyAsync();
        });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public cleanScan() {
    this.tagArr = [];
    this.foundTags = [];
    this.filterFoundTags = undefined as any;
    this.notFoundTags = [];
    this.filterNotFoundTags = undefined as any;
    this.notAllocatedTags = [];
    this.filterNotAllocatedTags = undefined as any;
  }

  public excelData(): ExcelExportData {
    const result: ExcelExportData = {
      data: this.stockTallyList,
    };

    return result;
  }

  public async addOrUpdateStockTally() {

    this.alertDialogService.ConfirmYesNo("Are you want to Save Changes?", "StockTally")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            let stockTallyHistoryObj = new StockTallyHistory();
            stockTallyHistoryObj.stockTallyList = this.stockTallyList;

            let response = await this.stockTallyService.addOrUpdateStockTally(stockTallyHistoryObj);
            if (response && response == 'added') {
              this.cloneStockTallyList = JSON.parse(JSON.stringify(this.stockTallyList));
              this.utilityService.showNotification("StockTally have been save Successfully!");
              await this.loadDateStockTallyHistory();
            }
            else if (response && response == 'updated') {
              this.cloneStockTallyList = JSON.parse(JSON.stringify(this.stockTallyList));
              this.utilityService.showNotification("StockTally have been updated Successfully!")
            }
            else
              this.alertDialogService.show("Something went wrong, Please try again later!", "error")

          } catch (error: any) {
            this.spinnerService.hide();
            this.alertDialogService.show(error.error);
          }

        }
      });
  }

  public async getStockTallyByDate() {
    this.alertDialogService.ConfirmYesNo(`Are you sure you want to load <b>${this.selectedDate}</b> StockTally Report?`, "StockTally")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            this.isSearch = true;
            let datePara = new Date(this.selectedDate);
            let historyResponse = await this.stockTallyService.getStockTallyHistoryByDate(datePara);
            if (historyResponse) {
              if (historyResponse.stockTallyList.length > 0) {
                this.stockTallyList = historyResponse.stockTallyList;
                this.loadCalCulateTotal();
                this.excelData = this.excelData.bind(this);
              }
              else
                this.alertDialogService.show(`Something went wrong about ${this.selectedDate} date Tally History , Please try again later`);
              this.spinnerService.hide();
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show(`Something went wrong about ${this.selectedDate} date Tally History , Please try again later`);
            }
          } catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show("Something went wrong, Please try again later");
          }

        }
      });


  }

  public async dateValueChange(dValue: any) {
    if (dValue) {
      let dateCompare = dValue.split('- ')[1];
      if (dateCompare) {
        let fetchDateValue = this.listDateItems.find(x => new Date(x.stockTallyDateValue).toLocaleDateString('en-GB') == dateCompare.trim());
        if (fetchDateValue)
          this.selectedDate = fetchDateValue?.stockTallyDateValue.toString() ?? new Date();
        else
          this.selectedDate = undefined as any;
      }

    }
    // else {
    //   if (this.showDate == undefined) {
    //     this.selectedDate = undefined as any;
    //     if (this.isSearch) {
    //       await this.loadStockTallyAsync();
    //       this.isSearch = false;
    //     }
    //   }
    // }

  }

  public async clearStockTallyByDate() {
    this.showDate = undefined as any;
    this.selectedDate = undefined as any;
    if (this.isSearch) {
      await this.loadStockTallyAsync();
      this.isSearch = false;
    }
  }

  public sortChange(sort: SortDescriptor[]): void {
    let event: any = { skip: 0 };
    this.sort = sort;
    this.filterFoundTags = this.rfIdGridPageChange(event, this.foundTags);
  }

  public deleteFoundStones() {
    this.alertDialogService.ConfirmYesNo(`Are you sure you want to delete selected <b>${this.myFoundSelection.join(", ")}</b> from Found Grid?`, "StockTally Delete")
      .subscribe(async (res: any) => {
        if (res.flag) {
          let event: any = { skip: 0 };
          this.myFoundSelection.forEach(element => {
            let deleteFIndex = this.foundTags.findIndex(x => x.stoneId == element);
            if (deleteFIndex >= 0)
              this.foundTags.splice(deleteFIndex, 1)
          });

          this.foundTags = this.foundTags.filter((v, i, a) => a.findIndex(v2 => (v2.rfid === v.rfid)) === i);
          this.filterFoundTags = this.rfIdGridPageChange(event, this.foundTags);
          this.myFoundSelection = new Array<string>();
        }
      });
  }

  public deleteNotFoundStones() {
    this.alertDialogService.ConfirmYesNo(`Are you sure you want to delete selected <b>${this.myNotFoundSelection.join(", ")}</b> from Not Found Grid?`, "StockTally Delete")
      .subscribe(async (res: any) => {
        if (res.flag) {
          let event: any = { skip: 0 };
          this.myNotFoundSelection.forEach(element => {
            let deleteNFIndex = this.notFoundTags.findIndex(x => x.stoneId == element);
            if (deleteNFIndex >= 0)
              this.notFoundTags.splice(deleteNFIndex, 1)
          });

          this.filterNotFoundTags = this.rfIdGridPageChange(event, this.notFoundTags);
          this.myNotFoundSelection = new Array<string>();
        }
      });
  }

  public deleteNotAllocatedStones() {
    this.alertDialogService.ConfirmYesNo(`Are you sure you want to delete selected <b>${this.myNotAllocatedSelection.join(", ")}</b> from Not Allocated Grid?`, "StockTally Delete")
      .subscribe(async (res: any) => {
        if (res.flag) {
          let event: any = { skip: 0 };
          this.myNotAllocatedSelection.forEach(element => {
            let deleteNAIndex = this.notAllocatedTags.findIndex(x => x.rfid == element);
            if (deleteNAIndex >= 0)
              this.notAllocatedTags.splice(deleteNAIndex, 1)
          });

          this.filterNotAllocatedTags = this.rfIdGridPageChange(event, this.notAllocatedTags);
          this.myNotAllocatedSelection = new Array<string>();
        }
      });
  }

  public openStockTallyBoxDialog() {
    this.isStockTallyBox = true;
  }

  public openStockTallyItemsDialog() {
    this.isStockTallyItems = true;
  }

  ngOnDestroy() {
    if (this.timer)
      this.routerOnDeactivate()
  }

}
