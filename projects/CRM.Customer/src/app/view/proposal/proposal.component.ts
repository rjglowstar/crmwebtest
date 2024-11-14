import { Component, ElementRef, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { Align } from '@progress/kendo-angular-popup';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { GridDetailConfig } from 'shared/businessobjects';
import { TypeFilterPipe } from 'shared/directives/typefilter.pipe';
import { GridConfig, GridMasterConfig, InclusionConfig, MasterConfig, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { StoneStatus, UtilityService, listGrainingItems } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { InvDetailData, InvItem, InventorySearchCriteria, WeightRange } from '../../businessobjects';
import { Lead, LeadSummary, Scheme, StoneProposal, SupplierDNorm } from '../../entities';
import { CustomerPrefStoneConfig } from '../../entities/customer/customerprefstoneconfig';
import { StoneProposalHistory } from '../../entities/stoneproposal/stoneproposalhistory';
import { CustomerService, GridPropertiesService, MasterConfigService, StoneProposalService } from '../../services';
import { StoneProposalHistoryService } from '../../services/stoneproposal/stoneproposalhistory.service';
//import { bodyFactory } from '@progress/kendo-angular-charts';

@Component({
  selector: 'app-proposal',
  templateUrl: './proposal.component.html',
  styleUrl: './proposal.component.css',
  encapsulation: ViewEncapsulation.None
})

export class ProposalComponent implements OnInit {
  //#region Grid Init
  @ViewChild("anchor") public anchor!: ElementRef;
  @ViewChild("popup", { read: ElementRef }) public popup!: ElementRef;
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView?: DataResult;
  public isRegEmployee: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = {
    checkboxOnly: true,
    mode: 'multiple',
  };
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public isShowCheckBoxAll: boolean = true;

  public gridViewSelected?: DataResult;
  public mySelectedSelection: string[] = [];

  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  //#endregion

  //#region Grid Config
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  //#endregion

  //#region List & Objects
  public inventoryObj: InvDetailData = new InvDetailData();

  public supplierDNormItems!: SupplierDNorm[];
  public selectedSupplierDNormItems?: { text: string; value: string };
  public selectedEmpItems?: { text: string, value: string };
  public selectedCPS?: string;
  public isBGM: boolean = false;
  public isNotificationShow: boolean = false;

  public listSupplierDNormItems: Array<{ text: string; value: string }> = [];
  public listBranchDNormItems: Array<{ text: string; value: string }> = [];
  public listDepartmentItems: Array<{ text: string; value: string }> = [];
  public listEmpItems: Array<{ text: string; value: string }> = [];

  public masterConfigList!: MasterConfig;
  public allTheLab?: MasterDNorm[];
  public allTheShapes?: MasterDNorm[];
  public allColors?: MasterDNorm[];
  public allClarities?: MasterDNorm[];
  public allTheFluorescences?: MasterDNorm[];
  public allTheCPS?: MasterDNorm[];

  public inclusionData: MasterDNorm[] = [];
  public inclusionFlag: boolean = false;
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  public listStatus: Array<{ name: string; isChecked: boolean }> = [];
  public listKToS: Array<{ name: string; isChecked: boolean }> = [];
  public listCulet: Array<{ name: string; isChecked: boolean }> = [];
  public listLocation: Array<{ name: string; isChecked: boolean }> = [];
  public listGrainingItems = listGrainingItems;

  public schemes: Scheme = new Scheme();

  public leadObj: Lead = new Lead();
  //#endregion

  //#region Model Flag
  public isEditInventory: boolean = false;
  public isSearchFilter: boolean = false;
  public isShowMedia: boolean = false;
  public showDiamonddetailModal = false;
  public isExcelModal = false;
  public isSummary = false;
  //#endregion

  public mediaTitle!: string
  public mediaSrc!: string
  public mediaType!: string

  public exportType: string = '';
  public exportFileType: string = "";
  public excelFile: any[] = [];

  //#region Custom Models
  public stoneId?: "";
  public certificateNo?: "";

  public newArrivalStoneDays = 10;

  public firstCaratFrom?: number;
  public firstCaratTo?: number;
  public secondCaratFrom?: number;
  public secondCaratTo?: number;
  public thirdCaratFrom?: number;
  public thirdCaratTo?: number;
  public fourthCaratFrom?: number;
  public fourthCaratTo?: number;
  public errRation: string = "";
  public errTotalDepth: string = "";
  public errTable: string = "";
  public errGirdlePer: string = "";
  public errGirdle: string = "";
  public errPavAngle: string = "";
  public errPavDepth: string = "";
  public errCrnAngle: string = "";
  public errCrnHeight: string = "";
  public errDiaMinimum: string = "";
  public errDiaMaximum: string = "";
  public errArrivalDate: string = "";
  public errLength: string = "";
  public errWidth: string = "";
  public errDepth: string = "";
  public errHeight: string = "";
  public errDollarPerCt: string = "";
  public errNetAmount: string = "";
  public customerPreference: CustomerPrefStoneConfig = new CustomerPrefStoneConfig;



  public filterLocChk: boolean = true;
  public filterCuletChk: boolean = true;
  public filterKtoSChk: boolean = true;
  public isSelectedShow: boolean = false;
  //#endregion

  public stoneProposal: StoneProposal = new StoneProposal();
  public inventoryItems: InvDetailData[] = [];
  public filterInventoryItems: InvDetailData[] = [];
  public invSearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();

  public leadStoneIds: string[] = [];

  public isFormValid: boolean = false;
  public showExcelOption = false;
  public excelOption!: string | null;

  public anchorAlign: Align = { horizontal: "right", vertical: "bottom" };
  public popupAlign: Align = { horizontal: "center", vertical: "top" };

  //#region Summary
  public totalLeadSummary: LeadSummary = new LeadSummary();
  public selectionLeadSummary: LeadSummary = new LeadSummary();
  //#endregion

  private routerSubscription!: Subscription;

  public fxUserId!: string;

  constructor(public sanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private masterConfigService: MasterConfigService,
    private spinnerService: NgxSpinnerService,
    private gridPropertiesService: GridPropertiesService,
    private router: Router,
    private customerService: CustomerService,
    private stoneProposalHistoryService: StoneProposalHistoryService,
    private stoneProposalService: StoneProposalService) { }

  public async ngOnInit() {
    // this.titleService.setTitle('Proposal');
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.activatedRoute.queryParams.subscribe(async params => {
      const token = params['Token'];
      if (token == undefined || token == null || token.length == 0) {
        this.router.navigate(['linkexpire']);
        return;
      }

      this.spinnerService.show();
      try {
        //Validate token
        let isSuccess = await this.stoneProposalService.tokenValidator(token);
        if (isSuccess) {

          this.fxUserId = await this.stoneProposalService.getUserIdByToken(token);
          if (this.fxUserId) {
            this.insertStoneProposalHistoryAction("LinkOpened", "Stone Proposal URL has been opened");

            //Get Customer prefernce data
            let res = await this.stoneProposalService.getCustomerPreferenceByCustomer(this.fxUserId);
            if (res) {
              this.customerPreference = res;

              //Get stone properties list from master config
              isSuccess = await this.getMasterConfigData();
              if (isSuccess) {

                isSuccess = await this.getGridConfiguration();
                if (isSuccess) {

                  //Get scheme data
                  if (!this.customerPreference.isHideVolDisc) {
                    this.schemes = await this.stoneProposalService.getOnlineSchemeAsync(false);
                    if (!this.schemes)
                      isSuccess = false;
                  }

                  // Get customer assigned stone id or criteria from token
                  if (isSuccess) {
                    let res = await this.stoneProposalService.getStoneProposalByToken(token ?? '');
                    if (res) {
                      this.stoneProposal = res;
                      if (res.selectedStoneIds) {
                        this.excelOption = res.selectedStoneIds.length > 0 ? "selected" : "searched"
                        this.mySelection = res.selectedStoneIds;
                      }

                      //Get stone data from customer assigned criteria
                      isSuccess = await this.initInventoryData(token);
                      if (isSuccess)
                        this.getCountryData();
                    }
                    else
                      isSuccess = false;
                  }
                }
              }
            }
            else
              isSuccess = false;
          }
          else
            isSuccess = false;
        }

        this.spinnerService.hide();

        if (!isSuccess) {
          this.spinnerService.hide();
          this.router.navigate(['linkexpire']);
          return;
        }
      }
      catch (error) {
        this.spinnerService.hide();
        console.error(error);
        this.router.navigate(['linkexpire']);
      }
    });
  }

  public async getGridConfiguration(): Promise<boolean> {
    try {
      this.gridConfig = await this.stoneProposalService.getGridConfig(this.fxUserId ?? '', "Proposal", "ProposalGrid", this.gridPropertiesService.getProposalGrid());
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
        this.gridMasterConfigResponse = await this.stoneProposalService.getMasterGridConfig("Proposal", "ProposalGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getProposalGrid();
      }
      if (this.customerPreference.isHidePrice)
        this.fields = this.fields.filter(c => !c.propertyName.includes("price"));

      return true;
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();

      return false;
    }
  }

  //#region Grid Configuration

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  //#endregion

  //#region Inv Search Filter Data
  public async getProposalData(token: string | undefined) {
    try {
      let res = await this.stoneProposalService.getStoneProposalByToken(token ?? '');
      if (res) {
        this.stoneProposal = res;
        if (res.selectedStoneIds) {
          this.excelOption = res.selectedStoneIds.length > 0 ? "selected" : "searched"
          this.mySelection = res.selectedStoneIds;
        }
      }
      else
        this.router.navigate(['linkexpire']);
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.router.navigate(['linkexpire']);
    }
  }

  public async initInventoryData(token: string | undefined): Promise<boolean> {
    try {
      let isSuccess = false;

      let res = await this.stoneProposalService.getInventoriesByStoneProposalToken(token ?? '');
      if (res && res.length > 0) {
        this.inventoryItems = res;
        this.sortResult();

        this.inventoryItems.forEach(item => {
          this.utilityService.changeAdditionalDataForCustomerInv(item, this.allTheShapes ?? []);
          item.diameter = this.utilityService.getMesurmentString(item.shape, item.measurement.length, item.measurement.width, item.measurement.height)
        });
        this.setAdditionalDiscount();
        
        this.filterInventoryItems = JSON.parse(JSON.stringify(this.inventoryItems));
        await this.setExistsLeadData();
        this.setGridData();

        isSuccess = true;
      }

      return isSuccess;
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);

      return false;
    }
  }

  private sortResult() {
    //Sort result here
    let shapeSort = this.masterConfigList.shape;
    let colorSort = this.masterConfigList.colors;
    let clartiySort = this.masterConfigList.clarities;
    let cpsSort = this.masterConfigList.cut;
    let flSort = this.masterConfigList.fluorescence;

    this.inventoryItems = this.inventoryItems
      .sort((a, b) => {
        let ashape = Number(shapeSort.find(z => z.name == a.shape)?.priority);
        let bshape = Number(shapeSort.find(z => z.name == b.shape)?.priority);
        if(ashape < bshape) return -1;
        if(ashape > bshape) return 1;

        if(a.weight < b.weight) return 1;
        if(a.weight > b.weight) return -1;

        let acolor = Number(colorSort.find(z => z.name == a.color)?.priority);
        let bcolor = Number(colorSort.find(z => z.name == b.color)?.priority);
        if(acolor < bcolor) return -1;
        if(acolor > bcolor) return 1;

        let aclarity = Number(clartiySort.find(z => z.name == a.clarity)?.priority);
        let bclarity = Number(clartiySort.find(z => z.name == b.clarity)?.priority);
        if(aclarity < bclarity) return -1;
        if(aclarity > bclarity) return 1;

        let acut = Number(cpsSort.find(z => z.name == a.cut)?.priority);
        let bcut = Number(cpsSort.find(z => z.name == b.cut)?.priority);
        if(acut < bcut) return -1;
        if(acut > bcut) return 1;

        let apolish = Number(cpsSort.find(z => z.name == a.polish)?.priority);
        let bpolish = Number(cpsSort.find(z => z.name == b.polish)?.priority);
        if(apolish < bpolish) return -1;
        if(apolish > bpolish) return 1;

        let asymm = Number(cpsSort.find(z => z.name == a.symmetry)?.priority);
        let bsymm = Number(cpsSort.find(z => z.name == b.symmetry)?.priority);
        if(asymm < bsymm) return -1;
        if(asymm > bsymm) return 1;

        let afl = Number(flSort.find(z => z.name == a.fluorescence)?.priority);
        let bfl = Number(flSort.find(z => z.name == b.fluorescence)?.priority);
        if(afl < bfl) return -1;
        if(afl > bfl) return 1;       

        return 0; 
      });
  }

  public setAdditionalDiscount() {
    if (this.inventoryItems && this.inventoryItems.length > 0 && this.stoneProposal) {
      if (!this.customerPreference.isHidePrice && this.stoneProposal.aDiscount && this.stoneProposal.aDiscount != 0) {
        this.inventoryItems.forEach(z => {
          z.price.discount = (z.price.discount ?? 0) + this.stoneProposal.aDiscount;

          let stoneRap = z.weight * (z.price.rap ?? 0);
          let calDiscount = 100 + z.price.discount;
          let netAmount = (calDiscount * stoneRap) / 100;

          z.price.netAmount = this.utilityService.ConvertToFloatWithDecimal(netAmount);
          let perCarat = netAmount / z.weight;
          z.price.perCarat = this.utilityService.ConvertToFloatWithDecimal(perCarat);
        });
      }
      this.calculateSummaryData();
    }
  }

  public calculateSummaryData() {
    let totalLead = this.mappingLeadData(this.inventoryItems);
    this.totalLeadSummary = this.calculateSummaryAll(totalLead.leadInventoryItems);

    if (this.mySelection && this.mySelection.length > 0) {
      let selectedInvs = this.inventoryItems.filter(z => this.mySelection.includes(z.stoneId));
      if (selectedInvs && selectedInvs.length > 0) {

        let selectedLead = this.mappingLeadData(selectedInvs);
        this.selectionLeadSummary = this.calculateSummaryAll(selectedLead.leadInventoryItems);
      }
    }
    else
      this.selectionLeadSummary = new LeadSummary();

  }

  //#region fullscreen 
  toggleFullScreen() {
    if (document.fullscreenElement) {
      this.exitFullScreen();
    } else {
      this.requestFullScreen();
    }
  }

  requestFullScreen() {
    const elem: any = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  }

  exitFullScreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }


  public async setExistsLeadData() {
    try {
      let res = await this.stoneProposalService.getLeadStoneIdsByCustomerAsync(this.stoneProposal.cutomer.id);
      if (res && res.length > 0) {
        this.leadStoneIds = res;
        let existsStones = this.mySelection.filter(z => res.includes(z));
        if (existsStones) {
          var result = await this.stoneProposalService.removeProposalSelectedStonesAsync(this.stoneProposal.id, existsStones);
          if (result)
            this.mySelection = this.mySelection.filter(z => !res.includes(z));
        }
      } else
        this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.router.navigate(['linkexpire']);
    }
  }

  public setGridData() {
    //Sort data here    
    let filterInventoryItems = this.filterInventoryItems.slice(this.skip, this.skip + this.pageSize);
    this.filterInventoryItems.forEach(z => {
      this.utilityService.changeAdditionalDataForCustomerInv(z, this.allTheShapes ?? []);
      z.imageURL = this.sanitizeURL('image', z);
      z.videoURL = this.sanitizeURL('video', z);
      z.certiURL = this.sanitizeURL('cert', z);
    });
    if (this.isSelectedShow)
      filterInventoryItems = filterInventoryItems.filter(z => this.mySelection.includes(z.stoneId));
    this.gridView = process(filterInventoryItems, { group: this.groups });
    this.gridView.total = this.filterInventoryItems.length;
    this.spinnerService.hide();
  }

  //#endregion

  //#region Master Config Data
  public async getMasterConfigData(): Promise<boolean> {
    let isSuccess = false;
    //Status
    Object.values(StoneStatus).forEach(z => { this.listStatus.push({ name: z.toString(), isChecked: false }); });

    //Master Config
    this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
    if (this.masterConfigList) {

      this.allTheShapes = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.shape);
      this.allColors = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.colors);
      this.allClarities = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.clarities);
      this.allTheFluorescences = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.fluorescence);
      this.allTheCPS = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.cps);
      this.allTheLab = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.lab);
      this.inclusionData = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.inclusions);
      this.inclusionConfig = this.masterConfigList.inclusionConfig;
      this.measurementData = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.measurements);
      this.measurementConfig = this.masterConfigList.measurementConfig;

      let allKTOS = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('ktos') !== -1);
      allKTOS.forEach(z => { this.listKToS.push({ name: z.name, isChecked: false }); });

      let allCulet = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('culet') !== -1);
      allCulet.forEach(z => { this.listCulet.push({ name: z.name, isChecked: false }); });

      isSuccess = true;
    }

    return isSuccess;
  }

  private async getCountryData() {
    this.listLocation = [];
    let listLocations: string[] = this.inventoryItems.map((u: InvDetailData) => u.location).filter((x: any, i: any, a: any) => x && a.indexOf(x) === i);
    if (listLocations)
      listLocations.forEach(z => { this.listLocation.push({ name: z, isChecked: false }); });
  }
  //#endregion

  //#region On Change Functions
  public async selectAll(e: any) {
    e.stopPropagation();
    // if (e.currentTarget.checked) {
    //   this.mySelection = [];
    //   let data = this.filterInventoryItems.map(z => z.stoneId);
    //   this.mySelection.push(...data);
    //   await this.AddtoSelection();
    // }
    // else {
    //   this.mySelection = [];
    //   await this.AddtoSelection();
    // }
  }

  public sanitizeURL(type: string, inv: InvDetailData) {
    let url: string = "commonAssets/images/image-not-found.jpg";
    switch (type.toLowerCase()) {
      case "image":
        url = inv.media.isPrimaryImage
          ? environment.imageURL.replace('{stoneId}', inv.stoneId.toLowerCase())
          : "commonAssets/images/image-not-found.jpg";
        break;
      case "video":
        url = inv.media.isHtmlVideo
          ? environment.videoURL.replace('{stoneId}', inv.stoneId.toLowerCase())
          : "commonAssets/images/video-not-found.png";
        break;
      case "cert":
        url = inv.media.isCertificate
          ? environment.certiURL.replace('{certiNo}', inv.certificateNo)
          : "commonAssets/images/certi-not-found.png";
        break;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public tagMapper(tags: string[]): void {
    // This function is used for hide selected items in multiselect box
  }

  public async selectedRowChange(e: any) {
    this.inventoryObj = new InvDetailData();
    if (e.selectedRows != null && e.selectedRows.length > 0) {
      let value: InvDetailData = e.selectedRows[0].dataItem;
      this.inventoryObj = { ...value };
    }
    if (this.leadStoneIds.length > 0) {
      //Check if Deselect All
      // let selectedStones: [{ dataItem: InvDetailData, index: number }] = e.selectedRows;
      // let selectedStoneIds = selectedStones.map(z => z.dataItem.stoneId);
      let nonExists = this.mySelection.find(z => !this.leadStoneIds.includes(z));
      if (nonExists == null || nonExists == undefined) {
        this.mySelection = [];
        this.excelOption = "searched";
        await this.AddtoSelection();
        return;
      }

      this.leadStoneIds.forEach(z => {
        let existIndex = this.mySelection.findIndex(a => a == z);
        if (existIndex >= 0)
          this.mySelection.splice(existIndex, 1);
      });
    }
    if (this.mySelection.length > 0)
      this.excelOption = "selected";
    else
      this.excelOption = "searched";
    await this.AddtoSelection();
  }

  public getValidDate(date: any): Date | null {
    if (date != null) {
      const day = moment(date).date();
      const month = moment(date).month();
      const year = moment(date).year();
      var newDate = new Date(year, month, day);
      return newDate;
    }
    return date;
  }

  public addRemoveStringInArrayFilter(a: string[], b: string) {
    if (b == 'All') {
      let c = [...a];
      c.forEach(z => { a.splice(0, 1); });
      return;
    }
    if (a.indexOf(b) == -1)
      a.push(b);
    else {
      let index = a.findIndex(x => x == b);
      if (index >= 0)
        a.splice(index, 1)
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.setGridData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.setGridData();
  }

  public calculateRapPricing() {
    let rap = this.inventoryObj.price.rap;
    let disc = this.inventoryObj.price.discount;
    if (rap && disc) {
      if (disc.toString() != '-') {

        disc = parseFloat(disc.toString());
        let weight = this.inventoryObj.weight;
        let stoneRap = weight * rap;
        let calDiscount = 100 + disc;
        let netAmount = (calDiscount * stoneRap) / 100;

        this.inventoryObj.price.netAmount = this.utilityService.ConvertToFloatWithDecimal(netAmount);
        let perCarat = netAmount / weight;
        this.inventoryObj.price.perCarat = this.utilityService.ConvertToFloatWithDecimal(perCarat);
      }
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

  public checkMinMaxValidation(min: any, max: any): string {
    if (min && max) {
      if (parseFloat(min) > parseFloat(max))
        return "min value must greater than max value!";
    }
    else if (min && !max)
      return "max value required!";
    else if (min && !max)
      return "min value required!";

    return '';
  }

  public checkCPS(type?: string) {
    if (type == 'BGM') {
      var NoMilkyData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkMilky = this.invSearchCriteriaObj.milky.indexOf(NoMilkyData?.name ?? 'NO');

      var NoGreenData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('green') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkGreen = this.invSearchCriteriaObj.green.indexOf(NoGreenData?.name ?? 'NO');

      let BrownData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkBrown = this.invSearchCriteriaObj.brown.indexOf(BrownData?.name ?? 'NO');

      if (checkMilky > -1 && checkGreen > -1 && checkBrown > -1)
        this.isBGM = true;
      else
        this.isBGM = false;
    }
    else {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      var VGData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'vg');

      var checkCutEX = this.invSearchCriteriaObj.cut.indexOf(ExData?.name ?? 'EX');
      var checkPolishEX = this.invSearchCriteriaObj.polish.indexOf(ExData?.name ?? 'EX');
      var checkSymmEX = this.invSearchCriteriaObj.symm.indexOf(ExData?.name ?? 'EX');

      var checkCutVG = this.invSearchCriteriaObj.cut.indexOf(VGData?.name ?? 'VG');
      var checkPolishVG = this.invSearchCriteriaObj.polish.indexOf(VGData?.name ?? 'VG');
      var checkSymmVG = this.invSearchCriteriaObj.symm.indexOf(VGData?.name ?? 'VG');

      if (checkCutEX > -1 && checkPolishEX > -1 && checkSymmEX > -1 && checkCutVG > -1 && checkPolishVG > -1 && checkSymmVG > -1)
        this.selectedCPS = '3VG';
      else if (checkCutEX > -1 && checkPolishEX > -1 && checkSymmEX > -1)
        this.selectedCPS = '3EX';
      else if (checkCutEX > -1 && checkPolishEX > -1)
        this.selectedCPS = '2EX';
      else
        this.selectedCPS = 'Clear';
    }
  }

  public changeCPSData(type: string) {
    this.selectedCPS = type != 'BGM' ? type : this.selectedCPS;
    if (type == '3EX') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      this.invSearchCriteriaObj.cut = [];
      this.invSearchCriteriaObj.cut.push(ExData?.name ?? 'EX');

      this.invSearchCriteriaObj.polish = [];
      this.invSearchCriteriaObj.polish.push(ExData?.name ?? 'EX');

      this.invSearchCriteriaObj.symm = [];
      this.invSearchCriteriaObj.symm.push(ExData?.name ?? 'EX');
    }
    else if (type == '2EX') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      this.invSearchCriteriaObj.cut = [];
      this.invSearchCriteriaObj.cut.push(ExData?.name ?? 'EX');

      this.invSearchCriteriaObj.polish = [];
      this.invSearchCriteriaObj.polish.push(ExData?.name ?? 'EX');

      this.invSearchCriteriaObj.symm = [];
    }
    else if (type == '3VG') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      var VGData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'vg');

      this.invSearchCriteriaObj.cut = [];
      this.invSearchCriteriaObj.cut.push(ExData?.name ?? 'EX');
      this.invSearchCriteriaObj.cut.push(VGData?.name ?? 'VG');

      this.invSearchCriteriaObj.polish = [];
      this.invSearchCriteriaObj.polish.push(ExData?.name ?? 'EX');
      this.invSearchCriteriaObj.polish.push(VGData?.name ?? 'VG');

      this.invSearchCriteriaObj.symm = [];
      this.invSearchCriteriaObj.symm.push(ExData?.name ?? 'EX');
      this.invSearchCriteriaObj.symm.push(VGData?.name ?? 'VG');
    }
    else if (type == 'Clear') {
      this.invSearchCriteriaObj.cut = [];
      this.invSearchCriteriaObj.polish = [];
      this.invSearchCriteriaObj.symm = [];

      this.invSearchCriteriaObj.green = [];
      this.invSearchCriteriaObj.brown = [];
      this.invSearchCriteriaObj.milky = [];
      this.isBGM = false;
    }
    else if (type == 'BGM') {
      if (this.isBGM) {
        this.invSearchCriteriaObj.green = [];
        this.invSearchCriteriaObj.brown = [];
        this.invSearchCriteriaObj.milky = [];
        this.isBGM = false;
      }
      else {
        this.isBGM = true;

        const inclusions = [...this.inclusionData];
        let BrownData = inclusions.filter(item => item.type.toLowerCase().indexOf('brown') !== -1);
        var NoBrownData = BrownData.find(z => z.name.toLowerCase() == 'no');
        this.invSearchCriteriaObj.brown = [];
        this.invSearchCriteriaObj.brown.push(NoBrownData?.name ?? 'NO');

        var NoGreenData = inclusions.filter(item => item.type.toLowerCase().indexOf('green') !== -1).find(z => z.name.toLowerCase() == 'no');
        this.invSearchCriteriaObj.green = [];
        this.invSearchCriteriaObj.green.push(NoGreenData?.name ?? 'NO');

        var NoMilkyData = inclusions.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).find(z => z.name.toLowerCase() == 'no');
        this.invSearchCriteriaObj.milky = [];
        this.invSearchCriteriaObj.milky.push(NoMilkyData?.name ?? 'NO');
      }
    }
  }

  public openEditInventoryDialog(): void {
    this.assignDropDownDataForEdit();
    this.isFormValid = false;
    this.isEditInventory = true;
    this.checkRequiredFields();
  }

  public closeEditInventoryDialog(): void {
    this.isEditInventory = false;
    this.mySelection = [];
  }

  public openSearchDialog(): void {
    this.isSearchFilter = true;
    this.insertStoneProposalHistoryAction("ClickedOnSearch", "Stone Proposal has clicked on Search");
  }

  public closeSearchDialog(): void {
    this.isSearchFilter = false;
    this.mySelection = [];
  }

  public openMediaDialog(type: string, inv: InvDetailData): void {
    let src = 'commonAssets/images/image-not-found.jpg';
    switch (type.toLowerCase()) {
      case "img":
        src = inv.media.isPrimaryImage
          ? environment.imageURL.replace('{stoneId}', inv.stoneId.toLowerCase())
          : "commonAssets/images/image-not-found.jpg";
        break;
      case "iframe":
        src = inv.media.isHtmlVideo
          ? environment.videoURL.replace('{stoneId}', inv.stoneId.toLowerCase())
          : "commonAssets/images/video-not-found.png";
        break;
      case "cert":
        src = inv.media.isCertificate
          ? environment.certiURL.replace('{certiNo}', inv.certificateNo)
          : "commonAssets/images/certi-not-found.png";
        break;
    }

    this.mediaSrc = src;
    this.mediaType = type;
    this.isShowMedia = true;
  }

  public closeMediaDialog(e: boolean): void {
    this.isShowMedia = e;
  }

  public onExcelToggle(): void {
    this.showExcelOption = !this.showExcelOption;
  }

  public clearSearchCriteria(form: NgForm): void {
    this.invSearchCriteriaObj = new InventorySearchCriteria();
    form.resetForm();
    this.firstCaratFrom = undefined;
    this.firstCaratTo = undefined;
    this.secondCaratFrom = undefined;
    this.secondCaratTo = undefined;
    this.thirdCaratFrom = undefined;
    this.thirdCaratTo = undefined;
    this.fourthCaratFrom = undefined;
    this.fourthCaratTo = undefined;
    this.insertStoneProposalHistoryAction("ClickedOnResetFilter", "Stone Proposal has reset search filter");
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
      this.insertStoneProposalHistoryAction("GridConfigChanged", "Stone Proposal has changed grid configuration");
    }
  }

  public calculateDateDiff(createdDate: Date): boolean {
    createdDate = new Date(createdDate);
    let currentDate = new Date();

    let days = Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate())) / (1000 * 60 * 60 * 24));
    if (days <= this.newArrivalStoneDays)
      return true;
    else
      return false;
  }
  //#endregion

  //#region CURD Functions
  public checkRequiredFields(): void {
    this.isFormValid = this.validateFields();
  }

  public validateFields(): boolean {
    const obj = this.inventoryObj;

    return this.checkStringNullOrEmpty(obj.stoneId)
      && this.checkStringNullOrEmpty(obj.kapan)
      && this.checkStringNullOrEmpty(obj.rfid)
      && this.checkStringNullOrEmpty(obj.shape)
      && this.checkStringNullOrEmpty(obj.weight?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.color)
      && this.checkStringNullOrEmpty(obj.clarity)
      && this.checkStringNullOrEmpty(obj.cut)
      && this.checkStringNullOrEmpty(obj.polish)
      && this.checkStringNullOrEmpty(obj.symmetry)
      && this.checkStringNullOrEmpty(obj.fluorescence)
      && this.checkStringNullOrEmpty(obj.price.rap?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.price.discount?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.price.netAmount?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.price.perCarat?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.inclusion.shade)
      && this.checkStringNullOrEmpty(obj.inclusion.brown)
      && this.checkStringNullOrEmpty(obj.inclusion.green)
      && this.checkStringNullOrEmpty(obj.inclusion.milky)
      && this.checkStringNullOrEmpty(obj.inclusion.hna)
      && this.checkStringNullOrEmpty(obj.inclusion.eyeClean)
      && this.checkStringNullOrEmpty(obj.measurement.depth?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.measurement.table?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.measurement.length?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.measurement.height?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.measurement.ratio?.toString() ?? '')
  }

  public checkStringNullOrEmpty(field: string): boolean {
    var flag = true;
    if (field == undefined || field == null || field?.length == 0 || (typeof field == 'undefined'))
      flag = false;
    return flag;
  }

  public assignAdditionalData(): void {
    let weightRanges = new Array<WeightRange>();

    if (this.firstCaratFrom && this.firstCaratTo) {
      let weight = new WeightRange();
      weight.minWeight = Number(this.firstCaratFrom);
      weight.maxWeight = Number(this.firstCaratTo);
      weightRanges.push(weight);
    }
    if (this.secondCaratFrom && this.secondCaratTo) {
      let weight = new WeightRange();
      weight.minWeight = Number(this.secondCaratFrom);
      weight.maxWeight = Number(this.secondCaratTo);
      weightRanges.push(weight);
    }
    if (this.thirdCaratFrom && this.thirdCaratTo) {
      let weight = new WeightRange();
      weight.minWeight = Number(this.thirdCaratFrom);
      weight.maxWeight = Number(this.thirdCaratTo);
      weightRanges.push(weight);
    }
    if (this.fourthCaratFrom && this.fourthCaratTo) {
      let weight = new WeightRange();
      weight.minWeight = Number(this.fourthCaratFrom);
      weight.maxWeight = Number(this.fourthCaratTo);
      weightRanges.push(weight);
    }
    this.invSearchCriteriaObj.weightRanges = weightRanges;
    this.invSearchCriteriaObj.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
    this.invSearchCriteriaObj.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];

    let fData = this.invSearchCriteriaObj.fromDate;
    this.invSearchCriteriaObj.fromDate = fData ? this.utilityService.setUTCDateFilter(fData) : null;

    let tData = this.invSearchCriteriaObj.toDate;
    this.invSearchCriteriaObj.toDate = tData ? this.utilityService.setUTCDateFilter(tData) : null;
  }

  public filterBySearch(): void {
    this.spinnerService.show();
    this.skip = 0;
    this.mySelection = [];
    this.assignAdditionalData();
    this.filterInventoryItems = this.filterInvsData(this.inventoryItems, this.invSearchCriteriaObj);
    this.setGridData();
    this.isSearchFilter = false;
    this.insertStoneProposalHistoryAction("ClickedOnSearchFilter", "Stone Proposal has filter out by search criteria");
  }

  //Match Name for Dropdown Selection
  public assignDropDownDataForEdit() {
    //Basic
    this.inventoryObj.shape = this.matchDropDownField(this.inventoryObj.shape, this.allTheShapes);
    this.inventoryObj.color = this.matchDropDownField(this.inventoryObj.color, this.allColors);
    this.inventoryObj.clarity = this.matchDropDownField(this.inventoryObj.clarity, this.allClarities);
    this.inventoryObj.fluorescence = this.matchDropDownField(this.inventoryObj.fluorescence, this.allTheFluorescences);
    this.inventoryObj.cut = this.matchDropDownField(this.inventoryObj.cut, this.allTheCPS);
    this.inventoryObj.polish = this.matchDropDownField(this.inventoryObj.polish, this.allTheCPS);
    this.inventoryObj.symmetry = this.matchDropDownField(this.inventoryObj.symmetry, this.allTheCPS);
    this.inventoryObj.lab = this.matchDropDownField(this.inventoryObj.lab, this.allTheLab);
    //Inclusion
    this.inventoryObj.inclusion.brown = this.matchDropDownField(this.inventoryObj.inclusion.brown, TypeFilterPipe.prototype.transform(this.inclusionData, 'brown'));
    this.inventoryObj.inclusion.shade = this.matchDropDownField(this.inventoryObj.inclusion.shade, TypeFilterPipe.prototype.transform(this.inclusionData, 'shade'));
    this.inventoryObj.inclusion.green = this.matchDropDownField(this.inventoryObj.inclusion.green, TypeFilterPipe.prototype.transform(this.inclusionData, 'green'));
    this.inventoryObj.inclusion.milky = this.matchDropDownField(this.inventoryObj.inclusion.milky, TypeFilterPipe.prototype.transform(this.inclusionData, 'milky'));

    this.inventoryObj.inclusion.sideBlack = this.matchDropDownField(this.inventoryObj.inclusion.sideBlack, TypeFilterPipe.prototype.transform(this.inclusionData, 'sideBlack'));
    this.inventoryObj.inclusion.centerSideBlack = this.matchDropDownField(this.inventoryObj.inclusion.centerSideBlack, TypeFilterPipe.prototype.transform(this.inclusionData, 'centerSideBlack'));
    // this.inventoryObj.inclusion.girdleBlack = this.matchDropDownField(this.inventoryObj.inclusion.girdleBlack, TypeFilterPipe.prototype.transform(this.inclusionData, 'girdleBlack'));
    this.inventoryObj.inclusion.centerBlack = this.matchDropDownField(this.inventoryObj.inclusion.centerBlack, TypeFilterPipe.prototype.transform(this.inclusionData, 'centerBlack'));
    this.inventoryObj.inclusion.sideWhite = this.matchDropDownField(this.inventoryObj.inclusion.sideWhite, TypeFilterPipe.prototype.transform(this.inclusionData, 'sideWhite'));
    this.inventoryObj.inclusion.centerSideWhite = this.matchDropDownField(this.inventoryObj.inclusion.centerSideWhite, TypeFilterPipe.prototype.transform(this.inclusionData, 'centerSideWhite'));
    // this.inventoryObj.inclusion.girdleWhite = this.matchDropDownField(this.inventoryObj.inclusion.girdleWhite, TypeFilterPipe.prototype.transform(this.inclusionData, 'girdleWhite'));
    this.inventoryObj.inclusion.centerWhite = this.matchDropDownField(this.inventoryObj.inclusion.centerWhite, TypeFilterPipe.prototype.transform(this.inclusionData, 'centerWhite'));

    this.inventoryObj.inclusion.openCrown = this.matchDropDownField(this.inventoryObj.inclusion.openCrown, TypeFilterPipe.prototype.transform(this.inclusionData, 'openCrown'));
    this.inventoryObj.inclusion.openTable = this.matchDropDownField(this.inventoryObj.inclusion.openTable, TypeFilterPipe.prototype.transform(this.inclusionData, 'openTable'));
    this.inventoryObj.inclusion.openPavilion = this.matchDropDownField(this.inventoryObj.inclusion.openPavilion, TypeFilterPipe.prototype.transform(this.inclusionData, 'openPavilion'));
    this.inventoryObj.inclusion.openGirdle = this.matchDropDownField(this.inventoryObj.inclusion.openGirdle, TypeFilterPipe.prototype.transform(this.inclusionData, 'openGirdle'));

    this.inventoryObj.inclusion.efoc = this.matchDropDownField(this.inventoryObj.inclusion.efoc, TypeFilterPipe.prototype.transform(this.inclusionData, 'eFOC'));
    this.inventoryObj.inclusion.efot = this.matchDropDownField(this.inventoryObj.inclusion.efot, TypeFilterPipe.prototype.transform(this.inclusionData, 'eFOT'));
    this.inventoryObj.inclusion.efop = this.matchDropDownField(this.inventoryObj.inclusion.efop, TypeFilterPipe.prototype.transform(this.inclusionData, 'eFOP'));
    this.inventoryObj.inclusion.efog = this.matchDropDownField(this.inventoryObj.inclusion.efog, TypeFilterPipe.prototype.transform(this.inclusionData, 'eFOG'));

    this.inventoryObj.inclusion.naturalOnCrown = this.matchDropDownField(this.inventoryObj.inclusion.naturalOnCrown, TypeFilterPipe.prototype.transform(this.inclusionData, 'naturalOnCrown'));
    this.inventoryObj.inclusion.naturalOnGirdle = this.matchDropDownField(this.inventoryObj.inclusion.naturalOnGirdle, TypeFilterPipe.prototype.transform(this.inclusionData, 'naturalOnGirdle'));
    this.inventoryObj.inclusion.naturalOnPavillion = this.matchDropDownField(this.inventoryObj.inclusion.naturalOnPavillion, TypeFilterPipe.prototype.transform(this.inclusionData, 'naturalonpavilion'));
    this.inventoryObj.inclusion.naturalOnTable = this.matchDropDownField(this.inventoryObj.inclusion.naturalOnTable, TypeFilterPipe.prototype.transform(this.inclusionData, 'naturalOnTable'));

    this.inventoryObj.inclusion.girdleCondition = this.matchDropDownField(this.inventoryObj.inclusion.girdleCondition, TypeFilterPipe.prototype.transform(this.inclusionData, 'girdleCondition'));
    this.inventoryObj.inclusion.culet = this.matchDropDownField(this.inventoryObj.inclusion.culet, TypeFilterPipe.prototype.transform(this.inclusionData, 'culet'));
    this.inventoryObj.inclusion.hna = this.matchDropDownField(this.inventoryObj.inclusion.hna, TypeFilterPipe.prototype.transform(this.inclusionData, 'hNA'));
    this.inventoryObj.inclusion.eyeClean = this.matchDropDownField(this.inventoryObj.inclusion.eyeClean, TypeFilterPipe.prototype.transform(this.inclusionData, 'eyeClean'));
    this.inventoryObj.inclusion.ktoS = this.matchDropDownField(this.inventoryObj.inclusion.ktoS, TypeFilterPipe.prototype.transform(this.inclusionData, 'ktoS'));
    this.inventoryObj.inclusion.flColor = this.matchDropDownField(this.inventoryObj.inclusion.flColor, TypeFilterPipe.prototype.transform(this.inclusionData, 'fLColor'));
    this.inventoryObj.inclusion.redSpot = this.matchDropDownField(this.inventoryObj.inclusion.redSpot, TypeFilterPipe.prototype.transform(this.inclusionData, 'redSpot'));
    this.inventoryObj.inclusion.luster = this.matchDropDownField(this.inventoryObj.inclusion.luster, TypeFilterPipe.prototype.transform(this.inclusionData, 'luster'));
    this.inventoryObj.inclusion.bowtie = this.matchDropDownField(this.inventoryObj.inclusion.bowtie, TypeFilterPipe.prototype.transform(this.inclusionData, 'bowtie'));
  }

  public matchDropDownField(field: string, list: MasterDNorm[] | undefined): string {
    var obj = list?.find(c => c.name.toLowerCase() == field?.toLowerCase() || c.displayName.toLowerCase() == field?.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(field?.toLowerCase()));
    if (obj)
      field = obj.name;
    return field;
  }
  //#endregion

  //#region Export To Excel
  public openExcelDialog() {
    this.isExcelModal = true;
  }

  public closeExcelDialog() {
    this.isExcelModal = false;
  }

  public onShowSelected() {
    this.isSelectedShow = !this.isSelectedShow;
    if (this.isSelectedShow) {
      this.insertStoneProposalHistoryAction("ShowSelectVisible", "Stone Proposal has clicked on Show Selected");
    } else {
      this.insertStoneProposalHistoryAction("ShowSelectRemoved", "Stone Proposal has clicked on Show Selected");
    }
    this.setGridData();
  }

  public async exportToExcel(type: string) {
    try {
      let data: InvDetailData[] = [];
      if (this.excelOption == 'selected') {
        if (this.mySelection.length == 0) {
          this.alertDialogService.show('Please select at least one stone!');
          return;
        }
        data = this.inventoryItems.filter(z => this.mySelection.includes(z.stoneId));
        if (type == "excel") {
          await this.exportExcelNew(data);
          this.insertStoneProposalHistoryAction("ExportSelectedAsExcel", "Stone Proposal has been download excel with selected stone");
        } else {
          this.generateExcelData(data);
          if (this.excelFile.length > 0)
            this.utilityService.exportAsCsvFile(this.excelFile, "Proposal_Csv", true);
          this.insertStoneProposalHistoryAction("ExportSelectedAsCsv", "Stone Proposal has been download csv with selected stone");
        }
      }
      else if (this.excelOption == 'searched') {
        data = [...this.inventoryItems];
        if (type == "excel") {
          await this.exportExcelNew(data);
          this.insertStoneProposalHistoryAction("ExportSearchAsExcel", "Stone Proposal has been download excel with search stone");
        } else {
          this.generateExcelData(data);
          if (this.excelFile.length > 0)
            this.utilityService.exportAsCsvFile(this.excelFile, "Proposal_Csv", true);
          this.insertStoneProposalHistoryAction("ExportSearchAsCsv", "Stone Proposal has been download csv with search stone");
        }
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Select type for export to excel!');
        return;
      }
      this.closeExcelDialog();
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async exportExcelNew(data: InvDetailData[]) {
    try {
      this.spinnerService.show();

      data.forEach(z => {
        z.imageURL = environment.imageURL;
        z.videoURL = environment.videoURL;
        z.certiURL = environment.certiURL;
        z.otherImageBaseURL = environment.otherImageBaseURL;
      })

      let response = await this.customerService.downloadProposalExcel(data);
      if (response) {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = `${this.utilityService.exportFileName(this.utilityService.replaceSymbols('Proposal'))}`;
        link.click();
        this.spinnerService.hide();
      }
    } catch (error: any) {
      this.alertDialogService.show("something went wrong, please try again or contact administrator");
      this.spinnerService.hide();
    }
  }
  //#endregion

  private async generateExcelData(data: InvDetailData[]) {

    this.excelFile = [];
    let dataFrom: number = 7;
    let dataTo: number = (data.length + dataFrom);

    this.excelFile.push({
      'Stone No': '',
      'Image link': '',
      'Video Link': '',
      'Video': '',
      'Lab': '',
      'Report No': 'Note: Use filter to select stones and check your selection average discount and total amount.',
      'Shape': '',
      'Carats': '',
      'Color': '',
      'Clarity': '',
      'Rap': '',
      'value': '',
      'Disc %': '',
      'Price/Ct': '',
      'Amount': '',
      'Cut': '',
      'Polish': '',
      'Sym': '',
      'Flour': '',
      'Measurement': '',
      'Table %': '',
      'Depth %': '',
      'Crown Angle': '',
      'Crown': '',
      'Pav Angle': '',
      'Pav Height': '',
      'Key To Symbols': '',
      'lower Half': '',
      'Girdle Thickness': '',
      'Girdle Size': '',
      'Ratio': '',
      'Natts': '',
      'HNA': '',
      'Comment': '',
      'Shade': '',
      'BGM Comment': '',
      'Location': '',
      'LabReceiveDate': ''
    });
    this.excelFile.push({
      'Stone No': '',
      'Image link': '',
      'Video Link': '',
      'Video': '',
      'Lab': '',
      'Report No': '',
      'Shape': 'No.of.Pcs',
      'Carats': 'Weight',
      'Color': '',
      'Clarity': '',
      'Rap': 'RAP AVG',
      'value': 'RAP TOTAL',
      'Disc %': 'AVG DIS%',
      'Price/Ct': 'AVG P.CT',
      'Amount': 'TOTAL VL',
      'Cut': '',
      'Polish': '',
      'Sym': '',
      'Flour': '',
      'Measurement': '',
      'Table %': '',
      'Depth %': '',
      'Crown Angle': '',
      'Crown': '',
      'Pav Angle': '',
      'Pav Height': '',
      'Key To Symbols': '',
      'lower Half': '',
      'Girdle Thickness': '',
      'Girdle Size': '',
      'Ratio': '',
      'Natts': '',
      'HNA': '',
      'Comment': '',
      'Shade': '',
      'BGM Comment': '',
      'Location': '',
      'LabReceiveDate': ''
    });
    this.excelFile.push({
      'Stone No': '',
      'Image link': '',
      'Video Link': '',
      'Video': '',
      'Lab': '',
      'Report No': 'All',
      'Shape': '=COUNTA(A' + dataFrom + ':A' + dataTo + ')',
      'Carats': '=ROUND(SUM(H' + (dataFrom - 1) + ':H' + dataTo + '),2)',
      'Color': '',
      'Clarity': '',
      'Rap': '=ROUND(L3/H3,2)',
      'value': '=ROUND(SUM(L' + dataFrom + ':L' + dataTo + '),2)',
      'Disc %': '=((O3/L3)*100)-100',
      'Price/Ct': '=O3/H3',
      'Amount': '=ROUND(SUM(O' + dataFrom + ':O' + dataTo + '),2)',
      'Cut': '',
      'Polish': '',
      'Sym': '',
      'Flour': '',
      'Measurement': '',
      'Table %': '',
      'Depth %': '',
      'Crown Angle': '',
      'Crown': '',
      'Pav Angle': '',
      'Pav Height': '',
      'Key To Symbols': '',
      'lower Half': '',
      'Girdle Thickness': '',
      'Girdle Size': '',
      'Ratio': '',
      'Natts': '',
      'HNA': '',
      'Comment': '',
      'Shade': '',
      'BGM Comment': '',
      'Location': '',
      'LabReceiveDate': ''
    });
    this.excelFile.push({
      'Stone No': '',
      'Image link': '',
      'Video Link': '',
      'Video': '',
      'Lab': '',
      'Report No': 'Selection',
      'Shape': '=SUBTOTAL(3,A' + dataFrom + ':A' + dataTo + ')',
      'Carats': '=ROUND(SUBTOTAL(9,H' + dataFrom + ':H' + dataTo + '),2)',
      'Color': '',
      'Clarity': '',
      'Rap': '=ROUND(L4/H4,2)',
      'value': '=ROUND(SUBTOTAL(9,L' + dataFrom + ':L' + dataTo + '),2)',
      'Disc %': '=((O4/L4)*100)-100',
      'Price/Ct': '=O4/H4',
      'Amount': '=ROUND(SUBTOTAL(9,O' + dataFrom + ':O' + dataTo + '),2)',
      'Cut': '',
      'Polish': '',
      'Sym': '',
      'Flour': '',
      'Measurement': '',
      'Table %': '',
      'Depth %': '',
      'Crown Angle': '',
      'Crown': '',
      'Pav Angle': '',
      'Pav Height': '',
      'Key To Symbols': '',
      'lower Half': '',
      'Girdle Thickness': '',
      'Girdle Size': '',
      'Ratio': '',
      'Natts': '',
      'HNA': '',
      'Comment': '',
      'Shade': '',
      'BGM Comment': '',
      'Location': '',
      'LabReceiveDate': ''
    });
    this.excelFile.push({
      'Stone No': '',
      'Image link': '',
      'Video Link': '',
      'Video': '',
      'Lab': '',
      'Report No': '',
      'Shape': '',
      'Carats': '',
      'Color': '',
      'Clarity': '',
      'Rap': '',
      'value': '',
      'Disc %': '',
      'Price/Ct': '',
      'Amount': '',
      'Cut': '',
      'Polish': '',
      'Sym': '',
      'Flour': '',
      'Measurement': '',
      'Table %': '',
      'Depth %': '',
      'Crown Angle': '',
      'Crown': '',
      'Pav Angle': '',
      'Pav Height': '',
      'Key To Symbols': '',
      'lower Half': '',
      'Girdle Thickness': '',
      'Girdle Size': '',
      'Ratio': '',
      'Natts': '',
      'HNA': '',
      'Comment': '',
      'Shade': '',
      'BGM Comment': '',
      'Location': '',
      'LabReceiveDate': ''
    });
    this.excelFile.push({
      'Stone No': 'Stone No',
      'Image link': 'Image link',
      'Video Link': 'Video link',
      'Video': 'Video',
      'Lab': 'Lab',
      'Report No': 'Report No',
      'Shape': 'Shape',
      'Carats': 'Carats',
      'Color': 'Color',
      'Clarity': 'Clarity',
      'Rap': 'Rap',
      'value': 'value',
      'Disc %': 'Disc %',
      'Price/Ct': 'Price/Ct',
      'Amount': 'Amount',
      'Cut': 'Cut',
      'Polish': 'Polish',
      'Sym': 'Sym',
      'Flour': 'Flour',
      'Measurement': 'Measurement',
      'Table %': 'Table %',
      'Depth %': 'Depth %',
      'Crown Angle': 'Crown Angle',
      'Crown': 'Crown',
      'Pav Angle': 'Pav Angle',
      'Pav Height': 'Pav Height',
      'Key To Symbols': 'Key To Symbols',
      'lower Half': 'lower Half',
      'Girdle Thickness': 'Girdle Thickness',
      'Girdle Size': 'Girdle Size',
      'Ratio': 'Ratio',
      'Natts': 'Natts',
      'HNA': 'HNA',
      'Comment': 'Comment',
      'Shade': 'Shade',
      'BGM Comment': 'BGM Comment',
      'Location': 'Location',
      'LabReceiveDate': 'LabReceiveDate'
    });

    data.forEach(z => {
      var excel = {
        'Stone No': z.stoneId,
        'Image link': z.media.isPrimaryImage ? ('=HYPERLINK("' + environment.imageURL.replace('{stoneId}', z.stoneId.toLowerCase()) + '","Image")') : '',
        'Video Link': z.media.isHtmlVideo ? ('=HYPERLINK("' + environment.videoURL.replace('{stoneId}', z.stoneId.toLowerCase()) + '","Video")') : '',
        'Video': z.media.isDownloadableVideo ? ('=HYPERLINK("' + environment.otherImageBaseURL.replace('{stoneId}', z.stoneId.toLowerCase()) + "/video.mp4" + '","Download")') : '',
        'Lab': z.lab,
        'Report No': z.certificateNo,
        'Shape': z.shape,
        'Carats': z.weight,
        'Color': z.color,
        'Clarity': z.clarity,
        'Rap': z.price.rap,
        'value': ((z.price.rap ?? 0) * z.weight),
        'Disc %': z.price.discount,
        'Price/Ct': z.price.perCarat,
        'Amount': z.price.netAmount,
        'Cut': z.cut,
        'Polish': z.polish,
        'Sym': z.symmetry,
        'Flour': z.fluorescence,
        'Measurement': this.utilityService.ConvertToFloatWithDecimalTwoDigit(z.measurement.length) + ' * ' + this.utilityService.ConvertToFloatWithDecimalTwoDigit(z.measurement.width) + ' * ' + this.utilityService.ConvertToFloatWithDecimalTwoDigit(z.measurement.height),
        'Table %': z.measurement.table,
        'Depth %': z.measurement.depth,
        'Crown Angle': z.measurement.crownAngle,
        'Crown': z.measurement.crownHeight,
        'Pav Angle': z.measurement.pavilionAngle,
        'Pav Height': z.measurement.pavilionDepth,
        'Key To Symbols': z.inclusion.ktoS,
        'lower Half': z.lrHalf,
        'Girdle Thickness': this.setGirdleThickness(z.measurement.minGirdle, z.measurement.maxGirdle),
        'Girdle Size': z.measurement.girdlePer,
        'Ratio': z.measurement.ratio,
        'Natts': z.inclusion.sideBlack + ' - ' + z.inclusion.centerBlack,
        'HNA': z.inclusion.hna,
        'Comment': z.comments,
        'Shade': z.inclusion.shade,
        'BGM Comment': z.bgmComments,
        'Location': z.location,
        'LabReceiveDate': z.labReceiveDate
      }
      this.excelFile.push(excel);
    });
  }

  private setGirdleThickness(minGirdle: string, maxGirdle: string): string {
    let thickness: string = minGirdle + ' to ' + maxGirdle;

    if (minGirdle == null || minGirdle == undefined || minGirdle?.length == 0)
      thickness = maxGirdle;

    if (maxGirdle == null || maxGirdle == undefined || maxGirdle?.length == 0)
      thickness = minGirdle;

    if (thickness == ' to ')
      thickness = '';

    return thickness;
  }

  //#region Filter By Inventory Search Criteria
  public filterInvsData(target: InvDetailData[], filter: InventorySearchCriteria): InvDetailData[] {
    var firstWtRange = (filter.weightRanges.length > 0) ? filter.weightRanges[0] : null;
    var secondWtRange = (filter.weightRanges.length > 1) ? filter.weightRanges[1] : null;
    var thirdWtRange = (filter.weightRanges.length > 2) ? filter.weightRanges[2] : null;
    var fourthWtRange = (filter.weightRanges.length > 3) ? filter.weightRanges[3] : null;

    return target.filter(z => this.filterInvData(z, filter, firstWtRange, secondWtRange, thirdWtRange, fourthWtRange));
  }

  public filterInvData(target: InvDetailData, filter: InventorySearchCriteria, frange: WeightRange | null, srange: WeightRange | null, trange: WeightRange | null, frrange: WeightRange | null): boolean {

    return this.filterFromWeightRanges(target.weight, frange, srange, trange, frrange)
      && this.utilityService.filterFromToDateValues(target.createdDate, filter.fromDate, filter.toDate)
      && (((filter.certificateNos.length > 0 && filter.stoneIds.length > 0) ?
        (this.utilityService.filterArrayString(target.certificateNo, filter.certificateNos) || this.utilityService.filterArrayString(target.stoneId, filter.stoneIds)) :
        (this.utilityService.filterArrayString(target.certificateNo, filter.certificateNos) && this.utilityService.filterArrayString(target.stoneId, filter.stoneIds))))
      && this.utilityService.filterArrayString(target.kapan, filter.kapan)
      && this.utilityService.filterCommonBoolen(target.isHold, filter.isHold)
      && this.utilityService.filterFromToNegativeDecimalValues(target.price.discount, filter.fromDiscount, filter.toDiscount)
      && this.utilityService.filterFromToDecimalValues(target.measurement.ratio, filter.fromRatio, filter.toRatio)
      && this.utilityService.filterFromToDecimalValues(target.measurement.depth, filter.fromDepth, filter.toDepth)
      && this.utilityService.filterFromToDecimalValues(target.measurement.table, filter.fromTable, filter.toTable)
      && this.utilityService.filterFromToDecimalValues(target.measurement.length, filter.fromLength, filter.toLength)
      && this.utilityService.filterFromToDecimalValues(target.measurement.width, filter.fromWidth, filter.toWidth)
      && this.utilityService.filterFromToDecimalValues(target.measurement.height, filter.fromHeight, filter.toHeight)
      && this.utilityService.filterFromToDecimalValues(target.measurement.crownHeight, filter.fromCrownHeight, filter.toCrownHeight)
      && this.utilityService.filterFromToDecimalValues(target.measurement.crownAngle, filter.fromCrownAngle, filter.toCrownAngle)
      && this.utilityService.filterFromToDecimalValues(target.measurement.pavilionDepth, filter.fromPavilionDepth, filter.toPavilionDepth)
      && this.utilityService.filterFromToDecimalValues(target.measurement.pavilionAngle, filter.fromPavilionAngle, filter.toPavilionAngle)
      && this.utilityService.filterFromToDecimalValues(target.measurement.girdlePer, filter.fromGirdlePer, filter.toGirdlePer)
      && this.utilityService.filterFromToDecimalValues(target.price.perCarat, filter.fromPerCarat, filter.toPerCarat)
      && this.utilityService.filterFromToDecimalValues(target.price.netAmount, filter.fromNetAmt, filter.toNetAmt)
      && this.utilityService.filterArrayString(target.location, filter.location)
      && this.utilityService.filterArrayString(target.shape, filter.shape)
      && this.utilityService.filterArrayString(target.color, filter.color)
      && this.utilityService.filterArrayString(target.clarity, filter.clarity)
      && this.utilityService.filterArrayString(target.fluorescence, filter.flour)
      && this.utilityService.filterArrayString(target.inclusion.shade, filter.shade)
      && this.utilityService.filterArrayString(target.lab, filter.lab)
      && this.utilityService.filterArrayString(target.cut, filter.cut)
      && this.utilityService.filterArrayString(target.polish, filter.polish)
      && this.utilityService.filterArrayString(target.symmetry, filter.symm)
      && this.utilityService.filterArrayString(target.inclusion.ktoS, filter.kToS)
      && this.utilityService.filterArrayString(target.inclusion.culet, filter.culet)
      && this.utilityService.filterArrayString(target.inclusion.sideBlack, filter.sideBlack)
      && this.utilityService.filterArrayString(target.inclusion.centerBlack, filter.centerBlack)
      && this.utilityService.filterArrayString(target.inclusion.sideWhite, filter.sideWhite)
      && this.utilityService.filterArrayString(target.inclusion.centerWhite, filter.centerWhite)
      && this.utilityService.filterArrayString(target.inclusion.brown, filter.brown)
      && this.utilityService.filterArrayString(target.inclusion.green, filter.green)
      && this.utilityService.filterArrayString(target.inclusion.milky, filter.milky)
      && this.utilityService.filterArrayString(target.inclusion.openCrown, filter.openCrown)
      && this.utilityService.filterArrayString(target.inclusion.openTable, filter.openTable)
      && this.utilityService.filterArrayString(target.inclusion.openPavilion, filter.openPavilion)
      && this.utilityService.filterArrayString(target.inclusion.openGirdle, filter.openGirdle)
      && this.utilityService.filterArrayString(target.inclusion.naturalOnGirdle, filter.naturalOnGirdle)
      && this.utilityService.filterArrayString(target.inclusion.naturalOnCrown, filter.naturalOnCrown)
      && this.utilityService.filterArrayString(target.inclusion.naturalOnPavillion, filter.naturalOnPavillion)
      && this.utilityService.filterArrayString(target.inclusion.naturalOnTable, filter.naturalOnTable)
      && this.utilityService.filterArrayString(target.inclusion.hna, filter.hNA)
      && this.utilityService.filterArrayString(target.inclusion.eyeClean, filter.eyeClean)
      && this.utilityService.filterArrayString(target.inclusion.efoc, filter.eFOC)
      && this.utilityService.filterArrayString(target.inclusion.efop, filter.eFOP)
      && this.utilityService.filterArrayString(target.inclusion.efog, filter.eFOG)
      && this.utilityService.filterArrayString(target.inclusion.efot, filter.eFOT)
      && this.utilityService.filterArrayString(target.inclusion.girdleCondition, filter.girdleCondition)
      && this.utilityService.filterArrayString(target.inclusion.luster, filter.luster)
      && this.utilityService.filterArrayString(target.inclusion.bowtie, filter.bowtie)
      && this.utilityService.filterArrayString(target.inclusion.iGrade, filter.iGrade)
      && this.utilityService.filterArrayString(target.measurement.mGrade, filter.mGrade);
  }

  private filterFromWeightRanges(target: number, frange: WeightRange | null, srange: WeightRange | null, trange: WeightRange | null, frrange: WeightRange | null): boolean {
    if (frange && srange && trange && frrange)
      return ((frange.minWeight ?? 0) <= target && (frange.maxWeight ?? 0) >= target) || ((srange.minWeight ?? 0) <= target && (srange.maxWeight ?? 0) >= target)
        || ((trange.minWeight ?? 0) <= target && (trange.maxWeight ?? 0) >= target) || ((frrange.minWeight ?? 0) <= target && (frrange.maxWeight ?? 0) >= target);
    else if (frange && srange && trange)
      return ((frange.minWeight ?? 0) <= target && (frange.maxWeight ?? 0) >= target) || ((srange.minWeight ?? 0) <= target && (srange.maxWeight ?? 0) >= target)
        || ((trange.minWeight ?? 0) <= target && (trange.maxWeight ?? 0) >= target);
    else if (frange && srange)
      return ((frange.minWeight ?? 0) <= target && (frange.maxWeight ?? 0) >= target) || ((srange.minWeight ?? 0) <= target && (srange.maxWeight ?? 0) >= target);
    else if (frange)
      return ((frange.minWeight ?? 0) <= target && (frange.maxWeight ?? 0) >= target);
    else
      return true;
  }
  //#endregion

  //#region Popup Close
  @HostListener("document:click", ["$event"])
  public documentClick(event: any): void {
    if (!this.contains(event.target)) {
      this.showExcelOption = false;
    }
  }

  private contains(target: any): boolean {
    return (
      this.anchor.nativeElement.contains(target) ||
      (this.popup ? this.popup.nativeElement.contains(target) : false)
    );
  }

  //#region Add to Lead
  public openSummaryModal() {
    let selectedInvs = this.inventoryItems.filter(z => this.mySelection.includes(z.stoneId));
    if (selectedInvs.length == 0) {
      this.closeSummaryModal();
      return;
    }
    this.leadObj = this.mappingLeadData(selectedInvs);

    this.gridViewSelected = process(selectedInvs, {});
    this.gridViewSelected.total = selectedInvs.length;

    this.mySelectedSelection = [];
    this.isSummary = true;
    this.insertStoneProposalHistoryAction("OpenedOrderModal", "Stone Proposal has been opened order modal");

  }

  public closeSummaryModal() {
    this.isSummary = false;
    this.insertStoneProposalHistoryAction("ClosedOrderModal", "Stone Proposal has been closed order modal");
  }

  public close(status: string): void {
    this.isNotificationShow = false;
  }

  public async addtoLead() {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to checkout stone(s)?", "Checkout")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();

            let selectedStones = this.inventoryItems.filter(z => this.mySelection.includes(z.stoneId));
            var data = this.mappingLeadData(selectedStones);

            var result = await this.stoneProposalService.insertLeadFromProposalAsync(data);
            if (result) {
              this.initInventoryData(this.stoneProposal.token);
              this.utilityService.showNotification(result)
              this.isNotificationShow = true;
              this.insertStoneProposalHistoryAction("ProposalOrderCheckout", "Stone Proposal has checkout the order");
              this.closeSummaryModal();
              this.spinnerService.hide();
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show('Something went wrong, Try again later!');
            }
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Something went wrong, Try again later!');
          }
        }
      });
  }

  //insert stoneProposal history item
  public async insertStoneProposalHistoryAction(action: string, desc: string) {
    try {
      var stoneProposalHistObj = new StoneProposalHistory()
      stoneProposalHistObj.stoneProposalId = this.stoneProposal.id;
      stoneProposalHistObj.customerId = this.fxUserId;
      stoneProposalHistObj.action = action;
      stoneProposalHistObj.description = desc;
      await this.stoneProposalHistoryService.InsertStoneProposalHistory(stoneProposalHistObj)
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public mappingLeadData(invs: InvDetailData[]): Lead {
    let lead: Lead = new Lead();

    lead.customer = this.stoneProposal.cutomer;
    lead.seller = this.stoneProposal.systemUser;

    invs.forEach(z => {
      //Other information get from Inventory Item data from backend
      let invItem = new InvItem();
      invItem.invId = z.invId;
      invItem.aDiscount = this.stoneProposal.aDiscount;

      //#region Prevent error on request (these data not used)
      invItem.stoneId = z.stoneId;
      invItem.weight = z.weight;
      invItem.price = z.price;
      //#endregion

      lead.leadInventoryItems.push(invItem);
    });

    lead.leadSummary = this.calculateSummaryAll(lead.leadInventoryItems);
    return lead;
  }
  //#endregion

  //#region Summary Calculation 
  public calculateSummaryAll(inventoryItems: InvItem[]): LeadSummary {
    let leadSummaryLocal = new LeadSummary();
    leadSummaryLocal.totalCarat = inventoryItems.reduce((acc, cur) => acc + cur.weight, 0);
    leadSummaryLocal.totalPcs = inventoryItems.length;

    if (!this.customerPreference.isHidePrice) {
      leadSummaryLocal.totalAmount = Number(inventoryItems.reduce((acc, cur) => acc + (cur.price.netAmount ? cur.price.netAmount : 0), 0).toFixed(2));
      leadSummaryLocal.totalRAP = inventoryItems.reduce((acc, cur) => acc + ((cur.price.rap ?? 0) * (cur.weight)), 0) ?? 0;
      leadSummaryLocal.avgRap = (leadSummaryLocal.totalRAP / leadSummaryLocal.totalCarat) ?? 0;
      leadSummaryLocal.avgDiscPer = (((leadSummaryLocal.totalAmount / leadSummaryLocal.totalRAP) * 100) - 100);
      leadSummaryLocal.perCarat = leadSummaryLocal.totalAmount / leadSummaryLocal.totalCarat;
    }

    //#region  VOW calculation
    if (!this.customerPreference.isHidePrice && !this.customerPreference.isHideVolDisc) {
      let totalVowValue = Number((leadSummaryLocal.totalAmount).toFixed(2));
      let vowDiscount = 0;
      if (this.schemes) {
        let schemeDetail = this.schemes.details.find(c => c.from <= totalVowValue && totalVowValue <= c.to);
        if (schemeDetail)
          vowDiscount = schemeDetail?.discount;
        leadSummaryLocal.totalVOWDiscPer = vowDiscount;
      }
    }
    //#endregion

    if (!this.customerPreference.isHidePrice) {
      if (leadSummaryLocal.totalVOWDiscPer && leadSummaryLocal.totalVOWDiscPer > 0) {
        leadSummaryLocal.totalVOWDiscAmount = this.utilityService.ConvertToFloatWithDecimal((leadSummaryLocal.totalAmount * leadSummaryLocal.totalVOWDiscPer) / 100);
        leadSummaryLocal.totalPayableAmount = this.utilityService.ConvertToFloatWithDecimal(leadSummaryLocal.totalAmount - leadSummaryLocal.totalVOWDiscAmount);
        leadSummaryLocal.discPer = this.utilityService.ConvertToFloatWithDecimal(((leadSummaryLocal.totalPayableAmount / leadSummaryLocal.totalRAP) * 100) - 100);
        leadSummaryLocal.pricePerCarat = this.utilityService.ConvertToFloatWithDecimal(leadSummaryLocal.totalPayableAmount / leadSummaryLocal.totalCarat);

      }
      else {
        leadSummaryLocal.totalVOWDiscAmount = 0;
        leadSummaryLocal.totalPayableAmount = this.utilityService.ConvertToFloatWithDecimal(leadSummaryLocal.totalAmount);
        leadSummaryLocal.discPer = this.utilityService.ConvertToFloatWithDecimal(((leadSummaryLocal.totalPayableAmount / leadSummaryLocal.totalRAP) * 100) - 100);
        leadSummaryLocal.pricePerCarat = this.utilityService.ConvertToFloatWithDecimal(leadSummaryLocal.totalPayableAmount / leadSummaryLocal.totalCarat);
      }
    }

    return leadSummaryLocal;
  }
  //#endregion

  //#region Selection Stones CRUD
  public async AddtoSelection() {
    try {
      this.spinnerService.show();

      var result = await this.stoneProposalService.addProposalSelectedStonesAsync(this.stoneProposal.id, this.mySelection);
      if (result) {
        this.insertStoneProposalHistoryAction("StoneSelectionChanged", "Stone Proposal has changes selected stone");
        this.calculateSummaryData();
        this.spinnerService.hide();
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Selection not add, Try again later!');
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Selection not add, Try again later!');
    }
  }

  public async UpdatetoSelection() {
    try {
      this.spinnerService.show();

      var result = await this.stoneProposalService.updateProposalSelectedStonesAsync(this.stoneProposal.id, this.mySelection);
      if (result) {
        await this.getProposalData(this.stoneProposal.token);
        await this.initInventoryData(this.stoneProposal.token);
        this.alertDialogService.show('Stone added to selection..!');
        this.spinnerService.hide();
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Something went wrong, Try again later!');
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async openSelectionDeleteDialog() {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to remove?", "Remove Selection")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            var result = await this.stoneProposalService.removeProposalSelectedStonesAsync(this.stoneProposal.id, this.mySelectedSelection);
            if (result) {
              await this.getProposalData(this.stoneProposal.token);
              await this.initInventoryData(this.stoneProposal.token);
              this.openSummaryModal();

              this.alertDialogService.show('Stone removed from selection..!');
              this.spinnerService.hide();
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show('Something went wrong, Try again later!');
            }

          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Something went wrong, Try again later!');
          }
        }
      });
  }
  //#endregion

}
