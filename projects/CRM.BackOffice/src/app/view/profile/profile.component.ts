import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { fxCredential } from 'shared/enitites';
import { AppPreloadService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { Employee, ChangePasswordModel, User } from '../../entities';
import { EmployeeService, ManageService } from '../../services';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {

  public employeeObj: Employee = new Employee;
  private fxCredential!: fxCredential;
  public currentUser!: User[];
  public changePasswordModel: ChangePasswordModel = new ChangePasswordModel();
  public passwordPattern = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$!%*?&])([a-zA-Z0-9@#$!%*?&]{8,})$"

  constructor(
    private router: Router,
    private employeeService: EmployeeService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private appPreloadService: AppPreloadService,
    private manageService: ManageService,
  ) { }

  public async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  async defaultMethodsLoad() {
    this.spinnerService.show();
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);
    else
      await this.getEmployeeData(this.fxCredential.id);
  }

  public async getEmployeeData(id: string) {
    try {
      this.employeeObj = await this.employeeService.getEmployeeById(id);
      if (this.employeeObj)
        this.getUserData();
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getUserData() {
    try {
      this.currentUser = await this.manageService.getUserByMailId(this.employeeObj.email);
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async changePasswordClick(form: NgForm) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        var changePasswordModel = new ChangePasswordModel();
        if (this.currentUser[0].id) {
          changePasswordModel.userId = this.currentUser[0].id;
          changePasswordModel.oldPassword = form.value.passwords.oldpassword;
          changePasswordModel.newPassword = form.value.passwords.password;
          changePasswordModel.confirmPassword = form.value.passwords.confirmPassword;

          let res = await this.manageService.ChangePassword(changePasswordModel);
          if (res) {
            this.spinnerService.hide();
            this.alertDialogService.show(`Password Updated Successfuly`, 'Success');
            this.router.navigate(['login']);
          }
          else {
            this.spinnerService.hide();
            this.alertDialogService.show(`Password not update, Please Try again later!`, 'Error');
          }
        }
        else
          this.alertDialogService.show(`UUID Of User Not found`, 'Error');
      }
    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(`${error.error}`, 'Error');
    }
  }


}