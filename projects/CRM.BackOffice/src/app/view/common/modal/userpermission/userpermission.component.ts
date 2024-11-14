import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NavigationService, PermissionService } from '../../../../services';
import { Department, Employee } from '../../../../entities';
import { NavPanelItem, Permission, PermissionItem, UserRightItem, UserRights } from 'shared/businessobjects';
import { DeptPermission, EmpPermission, OriginPermission } from 'shared/enitites';
import { AlertdialogService } from 'shared/views';
import { UtilityService } from 'shared/services';

@Component({
  selector: 'app-userpermission',
  templateUrl: './userpermission.component.html',
  styleUrl: 'userpermission.component.css'
})
export class UserpermissionComponent implements OnInit {

  @Input() title!: string;
  @Input() selectedOrigin!: string;
  @Input() pageComeFromPermission!: string;
  @Input() deptPermi!: Department;
  @Input() empPermi!: Employee;
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();

  public navList!: NavPanelItem[];
  public permissinoList!: PermissionItem[];
  public originPermission: OriginPermission = new OriginPermission();
  public tempOriginPermission: OriginPermission = new OriginPermission();
  public deptPermission: DeptPermission = new DeptPermission();
  public tempDeptPermission: DeptPermission = new DeptPermission();
  public empPermission: EmpPermission = new EmpPermission();
  public tempEmpPermission: EmpPermission = new EmpPermission();
  public expandedFormItems: string[] = Array<string>();
  public currentSection: String = "Rights";
  public currentSectionIndex: number = 0;
  public navPanels: Array<UserRightItem> = new Array<UserRightItem>();
  public userRightItems: Array<UserRights> = new Array<UserRights>();
  public permissionPanels: Array<PermissionItem> = new Array<PermissionItem>();
  public userPermissionItems: Array<string> = new Array<string>();

  constructor(
    private navigationService: NavigationService,
    private permissionService: PermissionService,
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
    private utilityService: UtilityService
  ) { }

  async ngOnInit() {
    await this.defaultMethods()
  }

  public async defaultMethods() {
    this.navList = this.navigationService.getNavPanelItems();
    this.permissinoList = this.navigationService.getPermissionItem();

    if (this.pageComeFromPermission == "Origin") {
      //#region  origin page only
      this.originPermission = await this.permissionService.getOriginPermission(this.selectedOrigin);
      this.tempOriginPermission = { ...this.originPermission };

      if (this.originPermission)
        this.fetchValues(this.originPermission);
      else
        this.defaultInitliaztion();
      //#endregion origin page
    }
    else if (this.pageComeFromPermission == "Department") {
      //#region  Department page
      this.deptPermission = await this.permissionService.getDepartmentPermission(this.deptPermi.id);
      this.tempDeptPermission = { ...this.deptPermission };
      if (this.deptPermission)
        this.fetchValues(this.deptPermission);
      else
        this.defaultInitliaztion();

      //#endregion Department Page
    }
    else if (this.pageComeFromPermission == "Employee") {
      //#region  Employee page
      this.empPermission = await this.permissionService.getEmployeePermission(this.empPermi.id);

      this.tempEmpPermission = { ...this.empPermission };
      if (this.empPermission)
        this.fetchValues(this.empPermission);
      else
        this.defaultInitliaztion();
      //#endregion Employee Page
    }
  }

  public fetchValues(ObjectName: any) {
    //#region user navpanel
    let navPanel: UserRightItem;

    this.navList.forEach(nav => {
      let userRight = ObjectName.navGroups.find((c: any) => c.name == nav.name);
      navPanel = {
        group: nav.name,
        items: new Array<UserRights>(),
        isChecked: userRight != null ? true : false
      }

      if (nav.items && nav.items.length > 0) {
        nav.items.forEach(subNav => {
          let userRight = ObjectName.navItems.find((c: any) => c.name == subNav.name);
          var item = new UserRights();
          item.name = subNav.name;
          item.path = subNav.path;
          item.type = "NavItem";
          item.isChecked = userRight != null ? true : false;
          navPanel.items.push(item);
        });
      }
      this.navPanels.push(navPanel);
    });

    this.navPanels.forEach(element => {
      if (element.isChecked) {
        let userRight: UserRights = new UserRights();
        userRight.type = "NavGroup";
        userRight.name = element.group;
        this.userRightItems.push(userRight);

        element.items.forEach(sub => {
          if (sub.isChecked) {
            let userRightSub: UserRights = new UserRights();
            userRightSub.type = "NavItem";
            userRightSub.name = sub.name;
            userRightSub.path = sub.path;
            this.userRightItems.push(userRightSub);
          }
        });
      }
    });
    //#endregion navpanel

    //#region user permission
    this.userPermissionItems = ObjectName.actions.map((c: any) => c.name);

    let permissionPanel: PermissionItem;
    this.permissinoList.forEach(permission => {
      let userPermission = ObjectName.actions.find((d: any) => d.name == permission.name);

      permissionPanel = {
        name: permission.name,
        items: new Array<PermissionItem>(),
        isChecked: userPermission != null ? true : false
      }

      if (permission.items && permission.items.length > 0) {
        permission.items.forEach(subPermi => {
          let userPermi = ObjectName.actions.find((c: any) => c.name == subPermi.name);
          var item = new PermissionItem();
          item.name = subPermi.name;
          item.isChecked = userPermi != null ? true : false;
          permissionPanel.items.push(item);
        });
      }
      this.permissionPanels.push(permissionPanel);
    });

    //#endregion user permission
  }

  // initlization
  public defaultInitliaztion() {
    let navPanel: UserRightItem;
    this.navList.forEach(nav => {
      navPanel = {
        group: nav.name,
        items: new Array<UserRights>(),
        isChecked: false
      }
      if (nav.items && nav.items.length > 0) {
        nav.items.forEach(subNav => {
          var item = new UserRights();
          item.name = subNav.name;
          item.path = subNav.path;
          item.type = "NavItem";
          item.isChecked = false;
          navPanel.items.push(item);
        });
      }
      this.navPanels.push(navPanel);

    });

    let permissionPanel: PermissionItem;
    this.permissinoList.forEach(permission => {
      permissionPanel = {
        name: permission.name,
        items: new Array<PermissionItem>(),
        isChecked: false
      }

      if (permission.items && permission.items.length > 0) {
        permission.items.forEach(subPermi => {
          var item = new PermissionItem();
          item.name = subPermi.name;
          item.isChecked = false;
          permissionPanel.items.push(item);
        });
      }
      this.permissionPanels.push(permissionPanel);
    });
  }

  //nav Group
  public onExpandTreeview(name: string): void {
    if (this.expandedFormItems.includes(name))
      this.expandedFormItems.splice(this.expandedFormItems.indexOf(name), 1);
    else
      this.expandedFormItems.push(name);
  }

  public onCheckTreeview(type: string, name: string, parent: any): void {    
    let index = this.userRightItems.findIndex(x => x.type == type && x.name == name);
    if (index >= 0) {
      this.userRightItems.splice(index, 1);

      if (type == "NavGroup") {
        let ind = this.navPanels.findIndex(x => x.group == name);
        if (ind >= 0) {
          this.navPanels[ind].isChecked = false;
          this.navPanels[ind].items.forEach(item => {
            item.isChecked = false;
            let indx = this.userRightItems.findIndex(x => x.type == item.type && x.name == item.name);
            if (indx >= 0)
              this.userRightItems.splice(indx, 1);
          });
        }
      }
      else {
        let navPanel = this.navPanels.find(x => x.group == parent);
        if (navPanel && navPanel.group) {
          let parentIndex = this.navPanels.findIndex(x => x.group == parent);

          if (parentIndex >= 0) {
            let ind = navPanel.items.findIndex(x => x.name == name && x.type == type);
            if (ind >= 0) {
              this.navPanels[parentIndex].items[ind].isChecked = false;

              let group = this.userRightItems.filter(c => c.type == "NavItem" && this.navPanels[parentIndex].items.some(d => d.name == c.name));
              if (group.length == 0) {

                let groupIndex = this.userRightItems.findIndex(c => c.type == "NavGroup" && c.name == this.navPanels[parentIndex].group);
                if (groupIndex >= 0) {

                  this.userRightItems.splice(groupIndex, 1);
                  this.navPanels[parentIndex].isChecked = false;
                }
              }
            }
          }
        }
      }
    }
    else {
      let currNav = this.navPanels.find(x => x.group == parent);
      let curritem = currNav?.items;
      let currUserRight = curritem?.find(x => x.name == name);

      let userRight: UserRights = new UserRights();
      userRight.type = type;
      userRight.name = name;
      userRight.path = currUserRight?.path ?? "";
      this.userRightItems.push(userRight);

      if (type == "NavGroup") {
        let ind = this.navPanels.findIndex(x => x.group == name);
        if (ind >= 0) {
          this.navPanels[ind].isChecked = true;
          this.navPanels[ind].items.forEach(item => {
            let userRightItem: UserRights = new UserRights();
            item.isChecked = true;
            userRightItem.type = item.type;
            userRightItem.name = item.name;
            userRightItem.path = item.path;
            this.userRightItems.push(userRightItem);
          });
        }
      }
      else {
        let navPanel: any = this.navPanels.find(x => x.group == parent);
        if (navPanel && navPanel.group) {
          let parentIndex = this.navPanels.findIndex(x => x.group == navPanel.group);

          if (parentIndex >= 0) {
            let ind = navPanel.items.findIndex((x: any) => x.name == name && x.type == type);
            if (ind >= 0) {
              this.navPanels[parentIndex].items[ind].isChecked = true;
              if (!this.navPanels[parentIndex].isChecked)
                this.navPanels[parentIndex].isChecked = true;

              if (!this.userRightItems.some(c => c.type == "NavGroup" && c.name == navPanel.group)) {
                let userRightGroup: UserRights = new UserRights();
                userRightGroup.type = "NavGroup";
                userRightGroup.name = navPanel.group;
                this.userRightItems.push(userRightGroup);
              }
            }
          }
        }
      }
    }
  }
  //end nav Group

  //permission Group
  public setPermissionDetail(groupName: string): PermissionItem[] {
    var detail = this.permissionPanels.find(x => x.name == groupName);
    return detail?.items ?? [];
  }

  public onCheckPermissionRights(name: string, isChecked?: boolean): void {
    this.permissionPanels.forEach(element => {
      element.items.forEach(i => {
        if (i.name == name) {
          i.isChecked = !isChecked;
          let index = this.userPermissionItems.findIndex(x => x == name);
          if (index >= 0) {
            if (!i.isChecked)
              this.userPermissionItems.splice(index, 1);
            else
              this.userPermissionItems.push(name);
          }
          else {
            this.userPermissionItems.push(name);
          }
        }
      })
    })
  }
  // end permission Group

  // start setUserRightsAndPermissions
  public setUserRightsAndPermissions(objectName: any) {
    if (this.userRightItems && this.userRightItems.length > 0) {
      var navGroupList = this.userRightItems.filter(c => c.type == 'NavGroup');
      navGroupList.forEach(element => {
        var permission = new Permission();
        permission.name = element.name;
        objectName.navGroups.push(permission);
      });

      var navItemList = this.userRightItems.filter(c => c.type == 'NavItem');
      navItemList.forEach(element => {
        var permission = new Permission();
        permission.name = element.name;
        permission.path = element.path;
        objectName.navItems.push(permission);
      });
    }

    this.userPermissionItems.forEach(element => {
      var permission = new Permission();
      permission.name = element;
      objectName.actions.push(permission);
    });
  }
  // end setUserRightsAndPermissions

  //#region save user rights
  public async saveUserRights() {
    try {
      this.spinnerService.show();
      if (this.pageComeFromPermission == "Origin") {
        if (!this.originPermission)
          this.originPermission = new OriginPermission();
        this.originPermission.origin = this.selectedOrigin;
        this.originPermission.navGroups = [];
        this.originPermission.navItems = [];
        this.originPermission.actions = [];

        this.setUserRightsAndPermissions(this.originPermission);

        if (this.originPermission && this.originPermission.id) {
          let fetchOriginPermission = Object.assign({}, this.originPermission)
          if (JSON.stringify(fetchOriginPermission).toString() !== JSON.stringify(this.tempOriginPermission).toString()) {
            var flag: boolean = await this.permissionService.updateOriginPermission(this.originPermission);
            if (flag)
              this.closeUserPermissionDialog("Your Permissions & User rights has been updated successfully");
            else {
              this.spinnerService.hide();
              this.alertDialogService.show("Something went wrong while update Permission", "User Rights");
            }
          }
          else {
            this.closeUserPermissionDialog("Your Permissions & User rights has been updated successfully");
          }
        }
        else {
          var result: string = await this.permissionService.insertOriginPermission(this.originPermission);
          if (result) {
            if (result.toLocaleLowerCase() != "duplication!")
              this.closeUserPermissionDialog("Your Permissions & User rights has been added successfully");
            else {
              this.spinnerService.hide();
              this.alertDialogService.show("Duplicate Entry Found", "User Rights");
            }
          }
        }
      }
      else if (this.pageComeFromPermission == "Department") {
        if (!this.deptPermission) {
          this.deptPermission = new DeptPermission();

          this.deptPermission.departmentId = this.deptPermi.id;
          this.deptPermission.department = this.deptPermi.name;
          this.deptPermission.origin = this.deptPermi.origin;
        }

        this.deptPermission.navGroups = [];
        this.deptPermission.navItems = [];
        this.deptPermission.actions = [];

        this.setUserRightsAndPermissions(this.deptPermission);

        if (this.deptPermission && this.deptPermission.id) {
          let fetchDeptPermission = Object.assign({}, this.deptPermission)
          if (JSON.stringify(fetchDeptPermission).toString() !== JSON.stringify(this.tempDeptPermission).toString()) {
            var flag: boolean = await this.permissionService.updateDeptPermission(this.deptPermission);
            if (flag)
              this.closeUserPermissionDialog("Your Permissions & User rights has been updated successfully");
            else {
              this.spinnerService.hide();
              this.alertDialogService.show("Something went wrong while update Permission", "User Rights");
            }
          }
          else {
            this.closeUserPermissionDialog("Your Permissions & User rights has been updated successfully");
          }
        }
        else {
          var result: string = await this.permissionService.insertDeptPermission(this.deptPermission);
          if (result) {
            if (result.toLocaleLowerCase() != "duplication!")
              this.closeUserPermissionDialog("Your Permissions & User rights has been added successfully");
            else {
              this.spinnerService.hide();
              this.alertDialogService.show("Duplicate Entry Found", "User Rights");
            }
          }
        }
      }
      else if (this.pageComeFromPermission == "Employee") {
        if (!this.empPermission) {
          this.empPermission = new EmpPermission();

          this.empPermission.employeeId = this.empPermi.id;
          this.empPermission.employeeName = this.empPermi.fullName;
          this.empPermission.origin = this.empPermi.origin;
        }

        this.empPermission.navGroups = [];
        this.empPermission.navItems = [];
        this.empPermission.actions = [];

        this.setUserRightsAndPermissions(this.empPermission);

        if (this.empPermission && this.empPermission.id) {
          let fetchEmpPermission = Object.assign({}, this.empPermission)
          if (JSON.stringify(fetchEmpPermission).toString() !== JSON.stringify(this.tempEmpPermission).toString()) {
            var flag: boolean = await this.permissionService.updateEmpPermission(this.empPermission);
            if (flag)
              this.closeUserPermissionDialog("Your Permissions & User rights has been updated successfully");
            else {
              this.spinnerService.hide();
              this.alertDialogService.show("Something went wrong while update Permission", "User Rights");
            }
          }
          else
            this.closeUserPermissionDialog("Your Permissions & User rights has been updated successfully");
        }
        else {
          var result: string = await this.permissionService.insertEmpPermission(this.empPermission);
          if (result) {
            if (result.toLocaleLowerCase() != "duplication!")
              this.closeUserPermissionDialog("Your Permissions & User rights has been added successfully");
            else {
              this.spinnerService.hide();
              this.alertDialogService.show("Duplicate Entry Found", "User Rights");
            }
          }
        }
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  id(userRightItems: any, id: any, type: string) {
    throw new Error('Method not implemented.');
  }
  //#endregion

  //#region change section
  public changeSection(i: number): void {
    this.expandedFormItems = new Array<string>();
    this.currentSectionIndex += i;
    switch (this.currentSectionIndex) {
      case 0:
        this.currentSection = "Rights";
        break;
      case 1:
        this.currentSection = "Forms";
        break;
      case 2:
        this.currentSection = "Menu";
        break;
      case 3:
        this.currentSection = "Reports";
        break;
    }
  }
  //#endregion

  public closeUserPermissionDialog(message?: string): void {
    this.spinnerService.hide();
    this.toggle.emit(false);
    if (message)
      this.utilityService.showNotification(message)
  }

}