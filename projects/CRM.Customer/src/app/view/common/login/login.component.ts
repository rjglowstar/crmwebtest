import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DbLog, LoginModel, LoginResponse } from 'shared/enitites';
import { AccountService, LogService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { AppPreloadService, CustomerService, LoginhistoryService } from '../../../services';
import { DeviceDetectorService } from 'ngx-device-detector';
import * as moment from 'moment';
import { CustomerLoginHistory } from '../../../entities';
import { keys } from 'shared/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  public loginModelObj: LoginModel = new LoginModel();
  public loginLoading: boolean = false;
  public loginError: boolean = false;
  public errorMsg: string = '';
  public locationObj: any;
  public deviceInfo: any;
  public logoPath: string = ""
  public imagePath: string = ""
  public companyName: string = '';
  public socialPath: any;

  constructor(
    private router: Router,
    private appPreloadService: AppPreloadService,
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
    private utilityService: UtilityService,
    private accountService: AccountService,
    private deviceService: DeviceDetectorService,
    private customerService: CustomerService,
    private loginhistoryService: LoginhistoryService,
    private logService: LogService
  ) { }

  async ngOnInit() {

    this.clearSession();
    this.logoPath = this.utilityService.getCusLogoPath(window.location.href);
    this.imagePath = this.utilityService.getLoginImagePath(window.location.href);
    this.companyName = this.utilityService.getCompanyNameFromUrl(window.location.href);
    this.socialPath = this.utilityService.getSocialPath(window.location.href);
  }

  public async login(form: NgForm) {
    try {
      if (form.valid) {
        this.loginError = false;
        this.loginModelObj.client_id = 'ngAuthApp';
        this.loginModelObj.domain_type = 'Customer';
        this.startLoginLoading();

        this.loginModelObj.user_id = this.loginModelObj.user_id.trim();
        this.loginModelObj.password = this.loginModelObj.password.trim();
        let response = await this.accountService.loginUser(this.loginModelObj);
        if (response) {
          sessionStorage.setItem("userToken", JSON.stringify(response));
          localStorage.setItem('isVowBannerDisplay', 'true');
          this.setSession(response);
          await this.insertLoginHistory(response);
        }
        else {
          this.stopLoginLoading();
          this.alertDialogService.show("Something went wrong, Try again later.", "error");
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.loginError = true;

      if (error && error.error && error.error.toString().toLowerCase() == 'invalid user')
        this.errorMsg = "This user is invalid!";
      else if (error && error.error && error.error.toString().toLowerCase() == 'password is invalid')
        this.errorMsg = "Password is wrong!";
      else if (error && error.message) {
        if (error.message.toString().toLowerCase().includes('unknown error'))
          this.errorMsg = "Connection fail with server, Try again after some times!";
        else
          this.errorMsg = error.message.toString();
        this.addDbLog(JSON.stringify(error), this.loginModelObj.user_id);
      }
      else {
        this.errorMsg = "Login not working, Try again after some times!";
        this.addDbLog(JSON.stringify(error), this.loginModelObj.user_id);
      }

      this.stopLoginLoading();
    }
  }

  private async setSession(authToken: LoginResponse) {
    try {
      var credential = await this.appPreloadService.fetchFxCredentials(authToken.ident);
      if (credential) {
        keys.loginUserIdent = credential.fullName;
        this.stopLoginLoading();
        this.router.navigate(["dashboard"]);
      }
      else {
        this.stopLoginLoading();
        sessionStorage.clear();
        this.alertDialogService.show("Credential Not Found", "error");
      }
    }
    catch (error: any) {
      this.stopLoginLoading();
      this.alertDialogService.show(error.error, "error");
    }
  }

  private async insertLoginHistory(authToken: LoginResponse) {
    try {
      this.deviceInfo = this.deviceService.getDeviceInfo();
      const date = new Date();
      let customer = await this.customerService.getCustomerDNormByIdAsync(authToken.ident);
      let loginHistory: CustomerLoginHistory = new CustomerLoginHistory();
      loginHistory.customer = customer;
      loginHistory.publicipAddress = (this.locationObj && this.locationObj.ip) ? this.locationObj.ip : "";
      //loginHistory.privateipAddress = ClientIP ? ClientIP : "";
      loginHistory.loginTime = moment(date).toDate() ? moment(date).toDate() : this.utilityService.setUTCDateFilter(date)
      loginHistory.logoutTime = undefined;
      loginHistory.latitude = (this.locationObj && this.locationObj.latitude) ? this.locationObj.latitude.toString().substring(0, 14) : "";
      loginHistory.longitude = (this.locationObj && this.locationObj.longitude) ? this.locationObj.longitude.toString().substring(0, 14) : "";
      loginHistory.country = (this.locationObj && this.locationObj.country_name) ? this.locationObj.country_name.toString().toUpperCase() : "";
      loginHistory.state = (this.locationObj && this.locationObj.region) ? this.locationObj.region.toString().toUpperCase() : "";
      loginHistory.city = (this.locationObj && this.locationObj.city) ? this.locationObj.city.toString().toUpperCase() : "";

      if (this.deviceInfo) {
        loginHistory.browser = this.deviceInfo.browser;
        loginHistory.browserVersion = this.deviceInfo.browser_version;
        loginHistory.operatingSystem = this.deviceInfo.os;
        loginHistory.operatingSystemVersion = this.deviceInfo.os_version;
        loginHistory.userAgent = this.deviceInfo.userAgent;
      }
      await this.loginhistoryService.insertLoginHistory(loginHistory);
    }
    catch (error) {
      this.spinnerService.hide();
      this.alertDialogService.show("Login History Insert Problem", "Login");
    }
  }

  private startLoginLoading() {
    this.loginLoading = true;
    this.spinnerService.show();
  }

  private stopLoginLoading() {
    this.loginLoading = false;
    this.spinnerService.hide();
  }

  private clearSession(): void {
    sessionStorage.clear();
    localStorage.clear();
  }

  public loginClick() {
    let user = {
      email: "sampleUser@gmail.com",
      userName: "sampleUser",
      password: "123564",
      origin: "Admin"
    }
    // this.authenticationService.setLoginUser(user);
    this.router.navigate(['dashboard']);
  }
  public registerClick() {
    this.router.navigate(['register']);
  }
  public forgotClick() {
    this.router.navigate(['forgotpass']);
  }

  public navigateBackward(): void {
    window.history.back();
  }

  //#region  Add log
  private addDbLog(error: any, email: string) {
    try {
      let log: DbLog = new DbLog();
      log.action = 'Login';
      log.category = "Customer";
      log.controller = "Login";
      log.eventTime = new Date().toDateString();
      log.text = "Login Fail";
      log.ident = email;
      log.errorText = error;
      this.logService.insertLog(log);

    } catch (error: any) {
      console.error(error);
    }
  }
  //#endregion
}
