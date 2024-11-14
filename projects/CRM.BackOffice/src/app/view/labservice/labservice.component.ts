import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { PanelBarExpandMode } from '@progress/kendo-angular-layout';
import * as xlsx from 'xlsx';
import { GridDetailConfig } from 'shared/businessobjects';
import { CommonResponse, Lab, LabServiceType } from '../../businessobjects';
import { GridPropertiesService, LabService } from '../../services';
import { listActionType, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { fxCredential } from 'shared/enitites';

@Component({
  selector: 'app-broker',
  templateUrl: './Labservice.component.html',
  styleUrls: ['./labservice.component.css']
})

export class LabserviceComponent implements OnInit {
  public groups: GroupDescriptor[] = [];
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public isReg: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public openedConfirmationDetails = false;
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public labServiceObj: LabServiceType = new LabServiceType();
  public labServiceItems!: LabServiceType[];
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public insertFlag: boolean = true;
  public openedDelete: boolean = false;
  public expandMode: number = PanelBarExpandMode.Single;
  public listLabItems: Array<{ name: string; value: string }> = [];
  public labItems: Lab[] = [];
  public listLabServiceTypes: Array<{ name: string; value: string }> = [];
  public InsertlabExcelItems: LabServiceType[] = [];

  public listActionType: Array<{ text: string; value: string }> = [];
  
  private fxCredential!: fxCredential;

  public isViewButtons: boolean = false;

  constructor(
    private router: Router,
    private gridPropertiesService: GridPropertiesService,
    public utilityService: UtilityService,
    private labService: LabService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.fxCredential = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin' || this.fxCredential.origin.toLowerCase() == 'opmanager'))
      this.isViewButtons = true;

    Object.values(listActionType).forEach(z => { this.listActionType.push({ text: z.toString(), value: z.toString() }); });
    this.fields = await this.gridPropertiesService.getLabServiceGrid();
    this.labItems = await this.labService.getAllLabs();
    this.listLabItems = [];
    this.labItems.forEach(z => { this.listLabItems.push({ name: z.name, value: z.name }); });
    await this.loadData();
    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async loadData() {
    try {
      this.labServiceItems = await this.labService.getAlllabService();
      this.gridView = process(this.labServiceItems, { group: this.groups });
      this.gridView.total = this.labServiceItems.length;
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public selectedRowChange(e: any) {
    this.insertFlag = false;
    this.labServiceObj = new LabServiceType();
    let value: any = e.selectedRows[0].dataItem
    this.labServiceObj = { ...value };
  }

  public openAddDialog(): void {
    this.labServiceObj = new LabServiceType();
    this.insertFlag = true;
    this.isReg = true;
  }

  public openUpdateDialog(): void {
    this.isReg = true;
  }

  public closeDialog(form: NgForm): void {
    this.isReg = false;
    this.mySelection = [];
    this.resetForm(form);
  }

  public async onSubmit(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        let messageType: string = "";
        let response: any;
        let insertresponse: CommonResponse = new CommonResponse();

        if (!this.insertFlag) {
          messageType = "updated";
          response = await this.labService.labServiceUpdate(this.labServiceObj);
        }
        else {
          messageType = "inserted";
          let newLabExpense: LabServiceType = new LabServiceType();
          newLabExpense.labName = this.labServiceObj.labName;
          newLabExpense.service = this.labServiceObj.service;
          newLabExpense.serviceCode = this.labServiceObj.serviceCode;
          newLabExpense.action = this.labServiceObj.action;
          this.InsertlabExcelItems.push(newLabExpense);
          insertresponse = await this.labService.labServiceInsert(this.InsertlabExcelItems);
        }

        if (response || insertresponse) {
          this.loadData();
          this.mySelection = [];
          this.spinnerService.hide();
          if (action)
            this.isReg = false;
          this.resetForm(form);
          this.utilityService.showNotification(`You have been ${messageType} successfully!`)
        }
        else {
          this.alertDialogService.show(response.message);

          if (response?.errorMessage?.length > 0)
            console.error(response.errorMessage);
        }
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

  public resetForm(form?: NgForm) {
    this.labServiceObj = new LabServiceType();
    this.insertFlag = true;
    form?.reset();
  }

  public openDeleteDialog() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          this.mySelection = [];
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = await this.labService.deletelabService(this.labServiceObj.id)
            if (responseDelete !== undefined && responseDelete !== null) {
              this.loadData();
              this.spinnerService.hide();
              this.insertFlag = true;
              this.utilityService.showNotification(`You have been deleted successfully!`)
            }
          }
        })
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public openRedirect(pagename: string) {
    this.router.navigate(["/labservice/" + pagename, this.labServiceObj.id]);
  }


  //#region Excel Upload
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
        if (acceptedFiles.indexOf(target.files[0].type) > -1) {

          let file = target.files[0];
          let fileReader = new FileReader();
          this.InsertlabExcelItems = [];
          this.spinnerService.show();
          fileReader.onload = async (e) => {

            var arrayBuffer: any = fileReader.result;
            let data = new Uint8Array(arrayBuffer);
            let arr = new Array();

            for (let i = 0; i != data.length; ++i)
              arr[i] = String.fromCharCode(data[i]);

            let workbook = xlsx.read(arr.join(""), { type: "binary" });
            var fetchExcelItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any;

            if (fetchExcelItems && fetchExcelItems.length > 0) {

              this.InsertlabExcelItems = new Array<LabServiceType>();

              for (let j = 0; j < fetchExcelItems.length; j++) {
                Object.keys(fetchExcelItems[j]).map(key => {
                  if (key.toLowerCase().trim() != key) {
                    fetchExcelItems[j][key.toLowerCase().trim()] = fetchExcelItems[j][key];
                    delete fetchExcelItems[j][key];
                  }
                });

                let newLabExpense: LabServiceType = new LabServiceType();
                newLabExpense.labName = fetchExcelItems[j]["lab"]?.toString().trim();
                newLabExpense.service = fetchExcelItems[j]["service"]?.toString().trim();
                newLabExpense.serviceCode = fetchExcelItems[j]["code"]?.toString().trim();
                newLabExpense.action = fetchExcelItems[j]["action"]?.toString().trim();

                this.InsertlabExcelItems.push(newLabExpense);
              }

              let insertresponse: CommonResponse = new CommonResponse();
              insertresponse = await this.labService.labServiceInsert(this.InsertlabExcelItems);

              if (insertresponse) {
                this.loadData();
                this.mySelection = [];                
                this.utilityService.showNotification(`You have been Inserted successfully!`)
                this.spinnerService.hide();
              }
            }
          }
          fileReader.readAsArrayBuffer(file);
        }
        else
          this.alertDialogService.show(`Please select only CSV XLSX XLS file.`);
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }
  //#endregion

}