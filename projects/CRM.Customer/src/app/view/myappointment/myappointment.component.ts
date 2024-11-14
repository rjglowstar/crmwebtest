import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { GroupDescriptor, DataResult, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential } from 'shared/enitites';
import { AppPreloadService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { AppointmentResponse, AppointmentSearchCriteria } from '../../businessobjects';
import { Appointment, Customer } from '../../entities';
import { AppointmentService, CustomerService, GridPropertiesService } from '../../services';
import * as moment from 'moment';
@Component({
  selector: 'app-myappointment',
  templateUrl: './myappointment.component.html',
  styleUrl: './myappointment.component.css'
})

export class MyappointmentComponent implements OnInit {
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public filterFlag = false;
  public isAppointment = false;
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public appointmentCriteria: AppointmentSearchCriteria = new AppointmentSearchCriteria();
  public appointments: AppointmentResponse = new AppointmentResponse();
  public appointmentObj: Appointment = new Appointment();
  public selectedTime: Date = new Date();
  private fxCredential!: fxCredential;

  public stoneId = "";

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
    this.fields = await this.gridPropertiesService.getAppointmentGrid();
    await this.getCustomer();
    await this.load();
    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async load() {
    try {
      this.spinnerService.show();

      this.appointmentCriteria.customerid = this.fxCredential?.id;
      this.appointmentCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];

      this.appointments = await this.appointmentService.getAppointments(this.appointmentCriteria, this.skip, this.pageSize);
      this.gridView = process(this.appointments.appointments, { group: this.groups });
      this.gridView.total = this.appointments.totalCount;
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

  public filterSidebar() {
    this.filterFlag = !this.filterFlag;
  }

  public openAppointmentDialog(): void {
    this.isAppointment = true;
  }

  public closeAppointmentDialog(): void {
    this.isAppointment = false;
  }

  public onFilterSubmit(form: NgForm) {
    try {
      this.skip = 0
      this.mySelection = [];
      if (this.appointmentCriteria.createdfromDate != null)
        this.appointmentCriteria.createdfromDate = this.utilityService.setUTCDateFilter(this.appointmentCriteria.createdfromDate);
      if (this.appointmentCriteria.createdtoDate != null)
        this.appointmentCriteria.createdtoDate = this.utilityService.setUTCDateFilter(this.appointmentCriteria.createdtoDate);
      if (this.appointmentCriteria.approvedfromDate != null)
        this.appointmentCriteria.approvedfromDate = this.utilityService.setUTCDateFilter(this.appointmentCriteria.approvedfromDate);
      if (this.appointmentCriteria.approvedtoDate != null)
        this.appointmentCriteria.approvedtoDate = this.utilityService.setUTCDateFilter(this.appointmentCriteria.approvedtoDate);
      this.load()
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public clearFilter(form: NgForm) {
    form.reset()
    this.appointmentCriteria = new AppointmentSearchCriteria();
    this.stoneId = "";
    this.load()
  }

  public closeDialogHandler(event: any) {
    if (!event) {
      this.isAppointment = event;
      this.mySelection = [];
    }
  }

}
