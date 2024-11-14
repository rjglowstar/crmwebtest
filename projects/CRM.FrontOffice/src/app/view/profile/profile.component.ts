import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MasterConfig, MasterDNorm } from 'shared/enitites';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { ChangePasswordModel, EmailConfig, fxCredential, SystemUser, User, UserPricingCriteria } from '../../entities';
import { SystemUserService, UserPricingCriteriaService, AppPreloadService, ManageService } from '../../services';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {

  private fxCredential!: fxCredential;
  public systemUserObj: SystemUser = new SystemUser;

  public masterConfigList!: MasterConfig;

  public ShapesList: MasterDNorm[] = [];
  public LabList: MasterDNorm[] = [];
  public ColorList: MasterDNorm[] = [];
  public ClarityList: MasterDNorm[] = [];
  public FluorList: MasterDNorm[] = [];
  public CPSList: MasterDNorm[] = [];

  public allTheLab: Array<{ name: string; isChecked: boolean }> = [];
  public allTheShapes: Array<{ name: string; isChecked: boolean }> = [];
  public allColors: Array<{ name: string; isChecked: boolean }> = [];
  public allClarities: Array<{ name: string; isChecked: boolean }> = [];
  public allTheFluorescences: Array<{ name: string; isChecked: boolean }> = [];
  public allTheCut: Array<{ name: string; isChecked: boolean }> = [];
  public allTheSymm: Array<{ name: string; isChecked: boolean }> = [];
  public allThePolish: Array<{ name: string; isChecked: boolean }> = [];

  public systemUserCriteriaData: UserPricingCriteria[] = [];

  public lastDivNumber = [3, 7, 11, 15, 19];
  public emailConfig: EmailConfig = new EmailConfig();

  public currentUser!: User[];
  public changePasswordModel: ChangePasswordModel = new ChangePasswordModel();
  public passwordPattern = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$!%*?&])([a-zA-Z0-9@#$!%*?&]{8,})$"

  constructor(
    private router: Router,
    private systemUserService: SystemUserService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private systemUserCriteriaService: UserPricingCriteriaService,
    private spinnerService: NgxSpinnerService,
    private appPreloadService: AppPreloadService,
    private manageService: ManageService,
  ) { }

  public async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region Initialize Data
  async defaultMethodsLoad() {
    this.spinnerService.show();
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);
    else {
      await this.getSystemUserData(this.fxCredential.id);
      await this.getUserPricingCriteriaData(this.fxCredential.id);
    }
  }

  public async getSystemUserData(id: string) {
    try {
      this.systemUserObj = await this.systemUserService.getSystemUserById(id);
      this.emailConfig = { ...this.systemUserObj.emailConfig };
      if (this.systemUserObj)
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
      this.currentUser = await this.manageService.getUserByMailId(this.systemUserObj.email);
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region SystemUser Criteria CRUD
  public async getUserPricingCriteriaData(id: string) {
    try {
      this.systemUserCriteriaData = await this.systemUserCriteriaService.getUserPricingCriteriaBySystemUser(id);
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

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
