import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { NgxSpinnerService } from 'ngx-spinner';
import { MasterConfigService, PriceExpiryCriteriaService, PricingConfigService } from '../../services';
import { fxCredential, PriceExpiryCriteria, PricingConfig } from '../../entities';
import { MasterConfig, MasterDNorm } from 'shared/enitites';

@Component({
  selector: 'app-pricingconfig',
  templateUrl: './pricingconfig.component.html',
  styleUrls: ['./pricingconfig.component.css']
})
export class PricingConfigComponent implements OnInit {
  public organizationId!: string;
  public pricingConfig: PricingConfig = new PricingConfig();
  public temppricingConfig: PricingConfig = new PricingConfig();
  public isEditable: boolean = false;
  public websitePattern = "(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?"

  public expiryCriteriaData: PriceExpiryCriteria[] = [];
  public lastDivNumber = [3, 7, 11, 15, 19];
  public expiryCriteriaObj: PriceExpiryCriteria = new PriceExpiryCriteria();
  public insertFlag: boolean = true;
  public isAddExpiryCriteria: boolean = false;

  public masterConfigList!: MasterConfig;

  public ShapesList: MasterDNorm[] = [];
  public ColorList: MasterDNorm[] = [];
  public ClarityList: MasterDNorm[] = [];
  public CPSList: MasterDNorm[] = [];

  public allTheShapes: Array<{ name: string; isChecked: boolean }> = [];
  public allColors: Array<{ name: string; isChecked: boolean }> = [];
  public allClarities: Array<{ name: string; isChecked: boolean }> = [];
  public allTheCps: Array<{ name: string; isChecked: boolean }> = [];
  public errWeight: string = '';

  public filterShape: string = '';
  public filterShapeChk: boolean = true;
  public filterColor: string = '';
  public filterColorChk: boolean = true;
  public filterClarity: string = '';
  public filterClarityChk: boolean = true;
  public filterCps: string = '';
  public filterCpsChk: boolean = true;

  public fxCredentials!: fxCredential | null;

  constructor(
    public route: ActivatedRoute,
    private pricingConfigService: PricingConfigService,
    public utilityService: UtilityService,
    private alertDialogService: AlertdialogService,
    private masterConfigService: MasterConfigService,
    private priceExpiryCriteriaService: PriceExpiryCriteriaService,
    private spinnerService: NgxSpinnerService) { }

  async ngOnInit() {
    await this.defaultMethods()
  }

  //#region Init Data
  public async defaultMethods() {
    this.spinnerService.show();
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    await this.getPricingConfig();
    await this.getMasterConfigData();
    await this.getExpiryCriteriaData();
  }

  public async getPricingConfig() {
    try {
      this.pricingConfig = await this.pricingConfigService.getPricingConfigData();
      if (this.pricingConfig)
        this.temppricingConfig = { ...this.pricingConfig };
      else
        this.pricingConfig = new PricingConfig();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getMasterConfigData() {
    //Master Config
    this.masterConfigList = await this.masterConfigService.getAllMasterConfig();

    this.ShapesList = this.masterConfigList.shape;
    let allTheShapes = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.shape);
    allTheShapes.forEach(z => { this.allTheShapes.push({ name: z.name, isChecked: false }); });

    this.ColorList = this.masterConfigList.colors;
    let allColors = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.colors);
    allColors.forEach(z => { this.allColors.push({ name: z.name, isChecked: false }); });

    this.ClarityList = this.masterConfigList.clarities;
    let allClarities = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.clarities);
    allClarities.forEach(z => { this.allClarities.push({ name: z.name, isChecked: false }); });

    this.CPSList = this.masterConfigList.cut;
    let allTheCPS = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.cut);
    allTheCPS.forEach(z => { this.allTheCps.push({ name: z.name, isChecked: false }); });
  }
  //#endregion

  public enableSaveChanges() {
    this.isEditable = true;
  }

  public disabledConfiguration() {
    this.isEditable = false;
    this.pricingConfig = this.temppricingConfig;
  }

  public async submit(form: NgForm, config: number) {
    try {
      if (form.valid) {
        let responseInsert = await this.pricingConfigService.updatePricingConfig(this.pricingConfig);
        if (responseInsert) {
          this.utilityService.showNotification("Updated successfully!");
          this.isEditable = false;
        }
        else
          this.alertDialogService.show('Something went wrong, Try again later!');
      }
      else {
        Object.keys(form.controls).forEach(key => {
          form.controls[key].markAsTouched();
        });
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  //#region Expiry Criteria
  public async getExpiryCriteriaData() {
    try {
      this.expiryCriteriaData = await this.priceExpiryCriteriaService.getAllPriceExpiryCriteria();
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public clearExpiryCriteria(form?: NgForm): void {
    this.expiryCriteriaObj = new PriceExpiryCriteria();
    form?.reset();
    this.errWeight = '';
    this.checkForCheckBoxInput();
    this.insertFlag = true;
  }


  public openAddExpiryCriteria(form?: NgForm) {
    this.clearExpiryCriteria(form);
    this.isAddExpiryCriteria = true;
  }

  public closeAddExpiryCriteria() {
    this.isAddExpiryCriteria = false;
  }

  public editExpiryCriteria(obj: PriceExpiryCriteria, isCopy: boolean = false): void {
    this.insertFlag = isCopy;
    this.expiryCriteriaObj = new PriceExpiryCriteria();
    this.expiryCriteriaObj = { ...obj };
    this.checkForCheckBoxInput();
    this.isAddExpiryCriteria = true;
  }

  public checkForCheckBoxInput(): void {
    this.utilityService.onMultiSelectChange(this.allTheShapes, this.expiryCriteriaObj.shape);
    this.utilityService.onMultiSelectChange(this.allColors, this.expiryCriteriaObj.color);
    this.utilityService.onMultiSelectChange(this.allClarities, this.expiryCriteriaObj.clarity);
    this.utilityService.onMultiSelectChange(this.allTheCps, this.expiryCriteriaObj.cps);
  }

  public async onCriteriaSubmit(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        let messageType = '';
        let response!: any;

        if (this.insertFlag) {
          this.expiryCriteriaObj.id = '';
          this.expiryCriteriaObj.createdBy = this.fxCredentials?.id ?? '';

          messageType = 'inserted';
          response = await this.priceExpiryCriteriaService.criteriaInsert(this.expiryCriteriaObj);
        }
        else {
          this.expiryCriteriaObj.updatedBy = this.fxCredentials?.id ?? '';

          messageType = 'updated';
          response = await this.priceExpiryCriteriaService.criteriaUpdate(this.expiryCriteriaObj);
        }

        if (response) {
          this.spinnerService.hide();
          this.clearExpiryCriteria();
          if (action)
            this.closeAddExpiryCriteria();

          this.utilityService.showNotification(`Record ` + messageType + ` successfully!`);
          sessionStorage.removeItem("PriceExpiryCriteria");
          await this.getExpiryCriteriaData();
        }
        else {
          this.spinnerService.hide();
          this.utilityService.showNotification(`Something went wrong, Try again later!`)
        }

      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public openDeleteDialog(id: string) {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = await this.priceExpiryCriteriaService.deleteCriteria(id)
            if (responseDelete !== undefined && responseDelete !== null) {
              sessionStorage.removeItem("PriceExpiryCriteria");
              await this.getExpiryCriteriaData();
              this.utilityService.showNotification(`Record deleted successfully!`)
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show('Something went wrong, Try again later!');
            }
          }
        });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

}
