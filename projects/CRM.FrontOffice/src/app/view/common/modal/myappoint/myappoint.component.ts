import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { GroupDescriptor, DataResult, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { Appointment } from 'projects/CRM.FrontOffice/src/app/entities';
import { AppointmentService, CustomerService, GridPropertiesService } from 'projects/CRM.FrontOffice/src/app/services';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential } from 'shared/enitites';
import { AppPreloadService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';

@Component({
  selector: 'app-myappoint',
  templateUrl: './myappoint.component.html',
  styleUrls: ['./myappoint.component.css']
})

export class MyappointComponent implements OnInit {  
  @Output() closeDialog = new EventEmitter();
  @Input() appointmentObj: Appointment = new Appointment();

  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0
  public fieldsStone!: GridDetailConfig[];
  public gridViewStone!: DataResult;
  public filterFlag = false;
  public isAppointment = false;
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public skeletonArray = new Array(18);  
  private fxCredential!: fxCredential;

  constructor(
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private customerService: CustomerService,
    private utilityService: UtilityService,
    private appPreloadService: AppPreloadService,
    private gridPropertiesService: GridPropertiesService,
    private appointmentService: AppointmentService
  ) { }

  async ngOnInit() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {    
    this.fieldsStone = await this.gridPropertiesService.getAppointmentStoneGrid();
    //await this.getCustomer();
    await this.load();
    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async load() {
    try {      
      this.spinnerService.show();
      this.gridViewStone = process(this.appointmentObj.stoneIds, { group: this.groups });
      this.gridViewStone.total = this.appointmentObj.stoneIds.length;
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public async getCustomer() {
    try {
      var res = await this.customerService.getCustomerDNormByIdAsync(this.fxCredential?.id ?? '');
      if (res)
        this.appointmentObj.customer = res;
      else
        this.alertDialogService.show('Customer not found, Try login again');
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Customer not found, Try login again');
    }
  }

  public async onSubmit(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        this.spinnerService.show();       
        let response: any;       
        this.appointmentObj.Status = "Pending"; 
        response = await this.appointmentService.AppointmentInsert(this.appointmentObj);
        if (response){         
          this.appointmentObj = new Appointment();
          this.closeMyAppointDialog();
          this.spinnerService.hide();
          this.utilityService.showNotification(`You appointment have been booked successfully!`)
        }
      }
      else {
        Object.keys(form.controls).forEach(key => {
          form.controls[key].markAsTouched();
        });
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public resetForm(form?: NgForm) {
    this.appointmentObj = new Appointment();
    form?.reset();
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.load();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.load();
  }

  public selectedRowChange(e: any) {
    this.appointmentObj = e.selectedRows[0].dataItem
  }
  
  // public deletestone(id: string): void {
  //   try {      
  //     let stoneIds = this.appointmentObj.stoneIds;
  //     var index = stoneIds.findIndex(x => x == id);
  //     if (index >= 0) {
  //       stoneIds.splice(index, 1);
  //       let tempSelectData = [...stoneIds];
  //       this.gridViewStone = { data: tempSelectData, total: tempSelectData.length };
  //       this.appointmentObj.stoneIds = stoneIds;
  //     }
  //   }
  //   catch (error: any) {
  //     this.spinnerService.hide();
  //     this.alertDialogService.show(error.error);
  //   }
  // }

  public async parentMethodCall() {
    this.isAppointment = false;
  }

  closeMyAppointDialog() {
    this.closeDialog.emit(false);
  }

}
