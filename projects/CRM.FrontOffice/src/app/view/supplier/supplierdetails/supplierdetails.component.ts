import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { NotificationService } from '@progress/kendo-angular-notification';
import { City, Country, State } from 'shared/businessobjects';
import { CommonService, listAddressTypeItems, listOriginItems, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { NgxSpinnerService } from 'ngx-spinner';
import { Supplier } from '../../../entities';
import { SupplierService} from '../../../services';

@Component({
  selector: 'app-organizationdetails',
  templateUrl: './supplierdetails.component.html',
  styleUrls: ['./supplierdetails.component.css']
})

export class SupplierdetailsComponent implements OnInit {

  public mobileMask = '(999) 000-00-00-00';
  public phoneMask = '(9999) 000-00-00';

  public supplierId!: string;
  public supplierData: Supplier = new Supplier();

  // Branch
  public isAddBranch: boolean = false;
  public countryItems!: Country[];
  public selectedCountry: any;
  public stateItems!: State[];
  public selectedState: any;
  public cityItems!: City[];
  public selectedCity: any;
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public listAddressTypeItems = listAddressTypeItems;
  public faxMask = '(999) 000-0000';
  public listOriginItems = listOriginItems;

  //Dept Permission
  public isPermission: boolean = false;
  public pageComeFromPermission!: string
  public modalTitle!: string;
  //

  constructor(public router: Router,
    public route: ActivatedRoute,
    private supplierService: SupplierService,
    private commonService: CommonService,
    public utilityService: UtilityService,
    public notificationService: NotificationService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService) { }

  async ngOnInit() {
    await this.defaultMethods()
  }

  public async defaultMethods() {
    this.spinnerService.show();
    await this.loadOrganizationDetail();    
  }

  //#region Branch
  public async loadOrganizationDetail() {
    try {
      this.supplierId = this.route.snapshot.params.id
      this.supplierData = await this.supplierService.getSupplierById(this.supplierId)
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion Branch
}