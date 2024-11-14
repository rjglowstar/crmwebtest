import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { AppPreloadService, ConfigService, listOriginItems, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { RemoveUserModel, User, UserSearchCriteria } from '../../entities';
import { GridPropertiesService, ManageService } from '../../services';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  public groups: GroupDescriptor[] = [];
  public selectableSettings: SelectableSettings = { mode: 'single' };
  public mySelection: string[] = [];

  public isSelected: boolean = false;
  public isFilter: boolean = false;
  public showDepartment = false;
  public showEmployee = false;
  public showAssignto = false;
  public AssignToText: string = 'Select Origin';

  public allData: User[] = [];
  public gridView!: DataResult;
  public listOriginItems = listOriginItems;
  public userObj: User = new User();

  public filterObj: UserSearchCriteria = new UserSearchCriteria();
  public emailUpdate = new Subject<string>();
  public phoneUpdate = new Subject<string>();
  public filterOrigin: string = '';
  // Grid Configuration
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public fields!: GridDetailConfig[];

  public isViewButtons: boolean = false;

  constructor(private manageService: ManageService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private utilityService: UtilityService,
    private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService,
    private appPreloadService: AppPreloadService,
    private router: Router,) {
    this.emailUpdate.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(value => {
        this.filterData();
      });

    this.phoneUpdate.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(value => {
        this.filterData();
      });
  }

  public async ngOnInit() {
    this.defaultMethodsLoad();
  }

  //#region Init Data
  public async defaultMethodsLoad() {
    this.spinnerService.show();
    await this.manageService.getAllUsers()
      .then((z: User[]) => {
        this.spinnerService.hide();
        this.allData = z;
        this.gridView = process(z, { group: this.groups });
        this.filterData();
      });
    this.spinnerService.hide();

    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin'))
      this.isViewButtons = true;

    await this.getGridConfiguration();
  }
  //#endregion

  //#region OnChange Functions
  public filterData(): void {
    let gridData = this.allData.filter(a => this.ApplyFilter(a.origin, this.filterObj.origin) &&
      this.ApplyFilter(a.email, this.filterObj.email) &&
      this.ApplyFilter(a.phoneNumber, this.filterObj.phoneNumber));

    this.gridView = process(gridData, { group: this.groups });
    if (this.filterObj.origin && this.filterObj.origin.length > 0)
      this.AssignToText = this.filterObj.origin;
  }

  public ApplyFilter(a: string, z: string): boolean {
    let filter = true;
    if ((a && a.length > 0) || (z && z.length > 0))
      filter = a?.includes(z);
    return filter;
  }

  public filterOriginList() {
    if (this.filterOrigin.length > 0) {
      let allOrigin: string[] = JSON.parse(JSON.stringify(listOriginItems));
      this.listOriginItems = allOrigin.filter(z => z.toLowerCase().includes(this.filterOrigin.toLowerCase()));
    }
    else
      this.listOriginItems = listOriginItems;
  }

  public openFilterDialog(): void {
    this.isFilter = true;
  }

  public closeFilterDailog(): void {
    this.isFilter = false;
    this.showAssignto = false;
    this.filterObj = new UserSearchCriteria();
    this.gridView = process(this.allData, { group: this.groups });
    this.AssignToText = 'Select Origin';
  }

  public toggleAssignto(): void {
    this.showAssignto = !this.showAssignto;
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.defaultMethodsLoad();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public selectedRowChange(e: any) {
    this.isSelected = true;
    this.userObj = new User();
    if (e.selectedRows != null && e.selectedRows.length > 0) {
      let value: User = e.selectedRows[0].dataItem;
      this.userObj = { ...value };
    }
  }

  public removeSelectedUser() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to remove this user?", "Remove")
        .subscribe(async (res: any) => {
          this.mySelection = [];
          this.isSelected = false;
          if (res.flag) {
            this.spinnerService.show();

            let removeUser = new RemoveUserModel();
            removeUser.userId = this.userObj.id;
            removeUser.email = this.userObj.email;

            let responseDelete = await this.manageService.removeteUser(removeUser);
            if (responseDelete !== undefined && responseDelete !== null) {
              this.spinnerService.hide();
              this.utilityService.showNotification(`User Removed successfully!`);
              this.defaultMethodsLoad();
            } else
              this.spinnerService.hide();
          }
        });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region Grid Configuration 
  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "User", "UserGrid", this.gridPropertiesService.getUserGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("User", "UserGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getUserGrid();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
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
  //#endregion

}
