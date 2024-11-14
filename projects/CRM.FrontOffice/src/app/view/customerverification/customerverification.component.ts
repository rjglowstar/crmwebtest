import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input-gg';
import { NgxSpinnerService } from 'ngx-spinner';
import { Country, CreditLimit, GridDetailConfig } from 'shared/businessobjects';
import { FileStore, GridConfig, GridMasterConfig, SystemUserPermission, fxCredential } from 'shared/enitites';
import { AppPreloadService, CommonService, ConfigService, FileStoreService, FileStoreTypes, NotificationService, StatusValue, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { CustomerVerificationSearchCriteria } from '../../businessobjects';
import { Configurations, RegisterCustomer, SystemUserDNorm } from '../../entities';
import { Customer } from '../../entities/customer/customer';
import { CustomerService, CustomerVerificationService, GridPropertiesService } from '../../services';

@Component({
  selector: 'app-customerverification',
  templateUrl: './customerverification.component.html',
  styles: [
  ]
})
export class CustomerverificationComponent implements OnInit {

  public isCustVerification: boolean = false;
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public filterFlag = true;
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public isRegSystemUser: boolean = false;
  public selectableSettings: SelectableSettings = { mode: 'single' };
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public countryItems!: Country[];
  public selectedCountry: any;
  public customerVerificationSearchCriteria: CustomerVerificationSearchCriteria = new CustomerVerificationSearchCriteria();
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.Belgium, CountryISO.Thailand, CountryISO.UnitedArabEmirates, CountryISO.UnitedStates];
  intMobileNo: any;
  public registerCustomer: RegisterCustomer = new RegisterCustomer();
  public creditLimit: CreditLimit = new CreditLimit();
  public incomeTaxNo: string = "";
  public customer: Customer = new Customer();
  public seller: SystemUserDNorm = new SystemUserDNorm();
  public listSellerDNormItems: Array<{ text: string; value: string }> = [];
  public sellerDNormItems!: SystemUserDNorm[];
  public selectedSellerDNormItem?: string;
  public fileStore: FileStore[] = [];
  public cloneFileStore: FileStore[] = [];
  public isShowDocument: boolean = false;
  public imgSrcDisplay!: string
  public isAddCustomerDialog: boolean = false;
  public profileTxt = FileStoreTypes.CustomerProfile;
  public indentProofTxt = FileStoreTypes.CustomerPhotoIdent;
  public businessProofTxt = FileStoreTypes.CustomerBussinessIdent
  public isAdminRole = false;
  public configurationObj: Configurations = new Configurations();
  public isCanAddCustomer: boolean = false;
  public statusList: Array<{ name: string; isChecked: boolean }> = [];


  constructor(public customerService: CustomerService,
    public customerVerificationService: CustomerVerificationService,
    private router: Router,
    private commonService: CommonService,
    public utilityService: UtilityService,
    private gridPropertiesService: GridPropertiesService,
    public notificationService: NotificationService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private appPreloadService: AppPreloadService,
    private fileStoreService: FileStoreService,
    private sanitizer: DomSanitizer
  ) { }

  async ngOnInit() {
    await this.defaultMethods();
  }

  public async defaultMethods() {
    try {
      await this.setUserRights();

      this.fxCredential = await this.appPreloadService.fetchFxCredentials();
      if (!this.fxCredential)
        this.router.navigate(["login"]);

      await this.getGridConfiguration();
      this.utilityService.filterToggleSubject.subscribe((flag) => {
        this.filterFlag = flag;
      });
      await this.getCountryData();

      if (this.fxCredential?.origin == 'Admin')
        this.isAdminRole = true;

      await this.loadCustomers();
      this.statusList = new Array<{ name: string; isChecked: boolean }>();
      this.preLoadStatusFilter();
    } catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async setUserRights() {
    let userPermissions: SystemUserPermission = new SystemUserPermission();
    let sesValue = sessionStorage.getItem("userPermission");
    if (sesValue)
      userPermissions = JSON.parse(sesValue) as SystemUserPermission;
    if (userPermissions.actions.length > 0) {
      let CanAddCustomer = userPermissions.actions.find(z => z.name == "CanAddCustomer");
      if (CanAddCustomer != null)
        this.isCanAddCustomer = true;
    }
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "CustomerVerification", "CustomerVerificationGrid", this.gridPropertiesService.getCustomerVerificationGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("CustomerVerification", "CustomerVerificationGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getCustomerVerificationGrid();
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  private async getCountryData() {
    try {
      this.countryItems = await this.commonService.getCountries();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public async loadCustomers() {
    try {
      let response: any = await this.customerVerificationService.getCustomers(this.customerVerificationSearchCriteria, this.skip, this.pageSize);
      if (response) {
        this.gridView = process(response.customers, { group: this.groups });
        this.gridView.total = response.totalCount;
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public openCustVerificationDialog(): void {
    try {
      this.isCustVerification = true;
      this.incomeTaxNo = "";
      this.seller = new SystemUserDNorm();
      this.creditLimit = new CreditLimit();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public closeCustVerificationDialog(): void {
    this.mySelection = [];
    this.isCustVerification = false;
  }

  //#region OnChange Functions
  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadCustomers();
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadCustomers();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public async selectedRowChange(e: any) {
    try {
      if (e.selectedRows != null && e.selectedRows.length > 0) {
        this.customer.cartExpireHour = 48;
        this.registerCustomer = e.selectedRows[0].dataItem;
        let imageList: FileStore[] = await this.fileStoreService.getFileByIdent(this.registerCustomer.id);
        this.cloneFileStore = [];
        if (imageList && imageList.length > 0) {
          for (let index = 0; index < imageList.length; index++) {
            const element = imageList[index];
            this.cloneFileStore.push({ ...element });
            element.fileThumbnail = this.loadImage(element.fileThumbnail) || null as any;
            element.filePath = await this.fileStoreService.getPathToBase64(element.id, element.type);
            element.filePath = this.loadImage(element.filePath) || null as any;
          }
          this.fileStore = [];
          this.fileStore = imageList;
        }
        else
          this.fileStore = [];
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
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

  public onFilterSubmit(form: NgForm) {
    this.mySelection = [];
    if (this.intMobileNo && this.intMobileNo.e164Number)
      this.customerVerificationSearchCriteria.mobileNo = this.intMobileNo.e164Number;
    else
      this.customerVerificationSearchCriteria.mobileNo = "";
    this.skip = 0;
    this.loadCustomers();
  }

  public clearFilter(form: NgForm) {
    this.mySelection = [];
    this.statusList = new Array<{ name: string; isChecked: boolean }>();
    this.customerVerificationSearchCriteria = new CustomerVerificationSearchCriteria();
    this.preLoadStatusFilter();
    this.loadCustomers();
  }

  public getSocialMediaData(socialMediaType: string) {
    return this.registerCustomer.socialMedias.find((c) => c.provider.providerName.toLowerCase() == socialMediaType.toLowerCase());
  }

  //#endregion

  public getImagePath(type: string) {
    let image: any = this.fileStore.find(z => z.type.toLowerCase() == type.toLowerCase());
    if (image)
      this.imgSrcDisplay = image.filePath;
    else
      this.imgSrcDisplay = "commonAssets/images/image-not-found.jpg";

  }

  private loadImage(imageSrc: string) {
    if (imageSrc != undefined && imageSrc != null && imageSrc != "")
      return 'data:image/JPEG;base64,' + imageSrc;
    else
      return null
  }

  public sanitizeURL(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public preLoadStatusFilter() {
    Object.values(StatusValue).forEach(z => { this.statusList.push({ name: z.toString(), isChecked: false }); });
    this.customerVerificationSearchCriteria.status.push(StatusValue.InProgress.toString());
    this.utilityService.onMultiSelectChange(this.statusList, this.customerVerificationSearchCriteria.status);
  }
}


