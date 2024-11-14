import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AppPreloadService } from '../../../services';
import { NgxSpinnerService } from 'ngx-spinner';
import { AccountService, UtilityService } from 'shared/services';
import { LoginModel, LoginResponse } from 'shared/enitites'
import { keys } from 'shared/auth';
import { AlertdialogService } from 'shared/views';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  public loginModelObj: LoginModel = new LoginModel();

  public loginLoading: boolean = false;
  public loginError: boolean = false;
  public errorMsg: string = ''

  constructor(private router: Router,
    private appPreloadService: AppPreloadService,
    private spinnerService: NgxSpinnerService,
    private utilityService: UtilityService,
    private alertDialogService: AlertdialogService,
    private accountService: AccountService) { }

  async ngOnInit() {
    this.clearSession();
  }

  public async login(form: NgForm) {
    try {
      this.loginError = false;
      if (form.valid) {
        this.loginModelObj.client_id = 'ngAuthApp';
        this.loginModelObj.domain_type = 'FrontOffice';
        this.startLoginLoading();

        this.loginModelObj.user_id = this.loginModelObj.user_id.trim();
        this.loginModelObj.password = this.loginModelObj.password.trim();
        let response = await this.accountService.loginUser(this.loginModelObj);
        if (response) {
          sessionStorage.setItem("userToken", JSON.stringify(response));
          this.sessionStorageTransferWithlocalStorage(response);
          this.setSession(response);
        }
        else {
          this.stopLoginLoading();
          this.alertDialogService.show("Something went wrong, Try again later.", "error");
        }
      }
    }
    catch (error: any) {
      this.loginError = true;
      this.stopLoginLoading();

      this.errorMsg = error.error;

      if (error && error.error && error.error.toLowerCase() == 'invalid user')
        this.errorMsg = "This user is invalid!";
      else if (error && error.error && error.error.toLowerCase() == 'password is invalid')
        this.errorMsg = "Password is wrong!";
    }
  }

  private sessionStorageTransferWithlocalStorage(userToken: any) {
    //Trigger event listner in view component
    window.localStorage.setItem('userToken', JSON.stringify(userToken));

    //remove session storage data from local storage
    setTimeout(() => {
      window.localStorage.removeItem('userToken');
    }, 500);
  }

  private async setSession(authToken: LoginResponse) {
    try {
      var credential = await this.appPreloadService.fetchFxCredentials(authToken.ident);
      if (credential) {
        var userPermission = await this.appPreloadService.fetchUserPermission(authToken.ident);
        if (userPermission) {
          keys.loginUserIdent = credential.fullName;
          this.stopLoginLoading();
          this.router.navigate(["dashboard"]);
        } else {
          this.loginError = true;
          this.errorMsg = "Permission not found!";
          this.stopLoginLoading();
        }
      } else {
        this.loginError = true;
        this.errorMsg = "User not found!";
        this.stopLoginLoading();
      }
    }
    catch (error: any) {
      this.loginError = true;
      this.stopLoginLoading();

      this.errorMsg = error.error;
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

}