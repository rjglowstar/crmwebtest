import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PanelBarExpandMode } from '@progress/kendo-angular-layout';
import { NgxSpinnerService } from 'ngx-spinner';
import { CustomerDNorm } from 'projects/CRM.Customer/src/app/entities';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { BusinessConfig, InvDistribution } from '../../entities';
import { BusinessconfigurationService, CustomerService } from '../../services';

@Component({
  selector: 'app-businessconfig',
  templateUrl: './businessconfig.component.html',
  styleUrls: ['./businessconfig.component.css']
})
export class BusinessconfigComponent implements OnInit {

  public expandMode: number = PanelBarExpandMode.Single;
  public businessConfig: BusinessConfig = new BusinessConfig();
  public businessRequest: BusinessConfig = new BusinessConfig();
  public editIndex: number = null as any;
  public reason: string = '';
  public qcReasonModel: string = "";
  public removeStoneReasonModel: string = "";
  public editQcReason: boolean = false;
  public editRSReason: boolean = false;
  public customerItems: CustomerDNorm[] = [];
  public listCustomer: Array<{ text: string; value: string }> = [];
  public selectedCustomer!: { text: string; value: string };
  public invDistributionObj: InvDistribution = new InvDistribution();
  public invDistributions: InvDistribution[] = [];
  public height: number = 186;
  public disabledOnline: boolean = false;
  public excelFile: any[] = [];
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };

  constructor(
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    private customerService: CustomerService,
    public businessconfigurationService: BusinessconfigurationService,
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    await this.loadBusinessConfiguration();
    await this.loadCustomers();
  }

  public async loadBusinessConfiguration() {
    try {
      this.spinnerService.show();
      this.businessConfig = new BusinessConfig();
      this.businessConfig = await this.businessconfigurationService.getBusinessConfiguration();
      this.invDistributions = JSON.parse(JSON.stringify(this.businessConfig.invDistributions))
      this.spinnerService.hide();
    } 
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  private async loadCustomers() {
    try {
      let res = await this.customerService.getAllCustomerDNormsByName('');
      if (res) {
        this.customerItems = res;
        this.listCustomer = [];
        res.forEach(z => { this.listCustomer.push({ text: z.companyName, value: z.id }); });
      }
      else
        this.alertDialogService.show('Customer not load, Try again later!');
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Customer not load, Try again later!');
    }
  }

  public async onReasonNameSubmit(form: NgForm, type: string) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        let response: any;
        this.businessRequest = new BusinessConfig();

        if (this.businessConfig)
          this.businessRequest = { ... this.businessConfig };
        if (type.toLowerCase() == "qcreason") {
          this.reason = this.qcReasonModel;
          if (this.businessRequest.id) {
            if (this.editQcReason)
              this.businessRequest.qcReasons[this.editIndex] = this.reason;
            else
              this.businessRequest.qcReasons.push(this.reason);

            response = await this.businessconfigurationService.updateBusinessConfig(this.businessRequest);
          }
          else {
            this.businessRequest.qcReasons.push(this.reason);

            response = await this.businessconfigurationService.insertBusinessConfig(this.businessRequest);
          }
        }
        else {
          this.reason = this.removeStoneReasonModel;
          if (this.businessRequest.id) {
            if (this.editRSReason)
              this.businessRequest.removeStoneReasons[this.editIndex] = this.reason;
            else
              this.businessRequest.removeStoneReasons.push(this.reason);
            response = await this.businessconfigurationService.updateBusinessConfig(this.businessRequest);
          }
          else {
            this.businessRequest.removeStoneReasons.push(this.reason);
            response = await this.businessconfigurationService.insertBusinessConfig(this.businessRequest);
          }
        }

        if (response)
          this.loadBusinessConfiguration();

        this.editIndex = null as any;
        if (type.toLowerCase() == "qcreason")
          this.editQcReason = false;
        else
          this.editRSReason = false;
        form.reset();
        this.spinnerService.hide();

      }
      else {
        this.spinnerService.hide();
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

  public editReasonNameDialog(item: string, index: number, type: string) {
    this.reason = '';
    if (type.toLowerCase() == "qcreason") {
      this.qcReasonModel = item;
      this.reason = item;
      this.editQcReason = true
    }
    else {
      this.removeStoneReasonModel = item;
      this.reason = item;
      this.editRSReason = true
    }


    this.editIndex = index;
  }

  public deleteReasonNameDialog(item: string, index: number, type: string) {
    try {
      this.clearReasonName(type);
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            this.businessRequest = new BusinessConfig();
            if (this.businessConfig)
              this.businessRequest = { ... this.businessConfig };

            if (type.toLowerCase() == "qcreason")
              this.businessRequest.qcReasons.splice(index, 1);
            else
              this.businessRequest.removeStoneReasons.splice(index, 1);

            let responseDelete = await this.businessconfigurationService.updateBusinessConfig(this.businessRequest);
            if (responseDelete !== undefined && responseDelete !== null) {
              this.spinnerService.hide();
              this.loadBusinessConfiguration();
              this.utilityService.showNotification(`You have been deleted reason successfully!`)
            }
          }
        });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public clearReasonName(type: string) {
    if (type.toLowerCase() == "qcreason") {
      this.qcReasonModel = null as any;
      this.editQcReason = false;
    }
    else {
      this.removeStoneReasonModel = null as any;
      this.editRSReason = false;
    }
  }

  //#region Fetch defaultdetails
  public async onDistributionSubmit(form: NgForm) {
    try {
      if (form.valid) {
        let findIndex = this.invDistributions.findIndex(x => x.priority == this.invDistributionObj.priority);
        if (findIndex > -1) {
          this.alertDialogService.show('Priority already exists!');
          return;
        }

        findIndex = this.invDistributions.findIndex(x => x.customer.id.toLowerCase() == this.selectedCustomer.value.toString().toLowerCase());
        if (findIndex > -1 && this.editIndex == null) {
          this.alertDialogService.show('Customer already exists!');
          return;
        }

        this.spinnerService.show();
        let selectedCustomer = this.customerItems.find(z => z.id == this.selectedCustomer.value);
        this.invDistributionObj.customer = selectedCustomer ?? new CustomerDNorm();

        if (this.editIndex == null)
          this.invDistributions.push(this.invDistributionObj);
        else {
          this.invDistributions[this.editIndex].priority = this.invDistributionObj.priority;
          this.invDistributions[this.editIndex].includeInBusiness = this.invDistributionObj.includeInBusiness;
        }

        this.businessConfig.invDistributions = this.invDistributions;
        let res = await this.businessconfigurationService.updateBusinessConfig(this.businessConfig);
        if (res) {
          this.clearDistribution(form);
          this.loadCustomers();
          this.spinnerService.hide();
          this.utilityService.showNotification('Data save successfully..!');
        }
        else {
          this.spinnerService.hide();
          this.alertDialogService.show('Data not save, Try again later!');
        }

        this.spinnerService.hide();
      }
      else {
        Object.keys(form.controls).forEach(key => {
          form.controls[key].markAsTouched();
        });
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Data not save, Try again later!');
    }
  }

  public deleteDistributionType(index: number) {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
      .subscribe(async (res: any) => {
        if (res.flag) {
          this.invDistributions.splice(index, 1);
          this.businessConfig.invDistributions = this.invDistributions;
          let res = await this.businessconfigurationService.updateBusinessConfig(this.businessConfig);
          if (res) {
            this.spinnerService.hide();
            this.utilityService.showNotification('Data remove successfully..!');
          }
          else {
            this.spinnerService.hide();
            this.alertDialogService.show('Data not remove, Try again later!');
          }
        }
      });
  }

  public clearDistribution(form: NgForm) {
    form?.reset();
    setTimeout(() => { this.invDistributionObj = new InvDistribution(); }, 0);
    this.editIndex = null as any;
  }
  public async exportCsv(data: InvDistribution) {
    try {
      this.spinnerService.show();
      let listOfStone: any = await this.businessconfigurationService.getBusinessConfigurationGetStoneIds(data.customer.id, data.includeInBusiness);
      const newListOfStone = listOfStone.map((val: any) => [val]);
      if (newListOfStone && newListOfStone.length > 0) {
        newListOfStone.unshift([data?.customer?.companyName])
        this.utilityService.exportAsCsvFile(newListOfStone, "Diamond_Csv", true);
        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async allExportToCsv() {
    try {
      this.spinnerService.show();
      const promises = this.invDistributions.map(res => this.businessconfigurationService.getBusinessConfigurationGetStoneIds(res.customer.id, res.includeInBusiness));
      Promise.all(promises).then(results => {
        const maxLength = Math.max(...results.map((subArr: any) => subArr.length));
        const result = Array.from({ length: maxLength }, (_, i) =>
          results.map((subArr: any) => subArr[i]).filter(value => value !== null)
        );
        if (result && result.length > 0) {
          result.unshift(this.invDistributions.map((subArr: any) => subArr.customer.companyName))
          this.utilityService.exportAsCsvFile(result, "Diamond_Csv", true);
          this.spinnerService.hide();
        }
      });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }

  }

  public editDistributionType(index: number) {
    this.editIndex = index;
    this.invDistributionObj = JSON.parse(JSON.stringify(this.invDistributions[index]));
    this.selectedCustomer = { text: this.invDistributionObj.customer.companyName, value: this.invDistributionObj.customer.id };
  }
  //#endregion

}
