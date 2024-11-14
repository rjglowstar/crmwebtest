import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AlertdialogService } from 'shared/views';
import { ForgotPasswordModel, OTPItem, ResetPasswordModel } from '../../../entities';
import { ForgetpasswordService } from '../../../services';
import { UtilityService } from 'shared/services';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxOtpInputConfig } from 'ngx-otp-input';

@Component({
  selector: 'app-forgotpass',
  templateUrl: './forgotpass.component.html',
  styleUrl: './forgotpass.component.css',
  encapsulation: ViewEncapsulation.None
})

export class ForgotpassComponent implements OnInit {

  // section varibales
  public emailSection: boolean = true;
  public codeSection: boolean = false;
  public setPasswordSection: boolean = false;
  public token: string = "";
  public mail: string = "";
  public optCode!: string;
  public passwordPattern = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$!%*?&])([a-zA-Z0-9@#$!%*?&]{8,})$"

  // forget password varibales
  public forgetPasswordObj: ForgotPasswordModel = new ForgotPasswordModel();
  public resetPasswordItem: ResetPasswordModel = new ResetPasswordModel();
  public logoPath: string = "";
  public logoPathWhite: string = "";
  public imagePath: string = "";
  public otpInputConfig: NgxOtpInputConfig = {
    otpLength: 4,
    autofocus: true,
    classList: {
      input: 'form-control',
    },
  };
  public emailVerification: boolean = false;
  public socialPath: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private alertDialogService: AlertdialogService,
    private utilityService: UtilityService,
    private forgetpasswordService: ForgetpasswordService,
    private spinnerService: NgxSpinnerService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        var snapshot = this.route.snapshot;
        if (snapshot.queryParams.authkey) {
          this.token = snapshot.queryParams.authkey;
          this.mail = snapshot.queryParams.email;
        }
      }
    });
  }

  async ngOnInit() {
    if (this.token && this.mail)
      await this.checkLinkVarification();

    this.logoPath = this.utilityService.getCusLogoPath(window.location.href);
    this.logoPathWhite = this.utilityService.getLogoPathWhite(window.location.href);
    this.imagePath = this.utilityService.getLoginImagePath(window.location.href);
    this.socialPath = this.utilityService.getSocialPath(window.location.href);    
  }

  private async checkLinkVarification() {
    var item = new OTPItem();
    item.token = this.token;
    item.email = this.mail;
    try {
      await this.forgetpasswordService.LinkValidation(item).then((result) => {
        if (result.toLowerCase().trim() == 'notexpired')
          this.verifyEmailSection();
        else
          this.router.navigate(['login']);
      }).catch((err) => {
        this.alertDialogService.show(`${err.error}`, 'Error');
      });
    } catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  private verifyEmailSection() {
    this.emailSection = !this.emailSection;
    this.codeSection = !this.emailSection;
  }

  private verifiedOTPSection() {
    this.codeSection = !this.codeSection;
    this.setPasswordSection = !this.codeSection;
  }

  public registerClick() {
    this.router.navigate(['register']);
  }

  public sendEmail(form: NgForm) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        let forgotPasswordModel = new ForgotPasswordModel();
        forgotPasswordModel.email = form.value.email;
        forgotPasswordModel.companyName = this.utilityService.getCompanyNameFromUrl(window.location.href);

        this.forgetpasswordService.forgetPassword(forgotPasswordModel).then((result) => {
          if (result.toLowerCase() == "success!") {
            this.emailVerification = true;
            this.emailSection = false;
            this.spinnerService.hide();
            this.utilityService.showNotification('Mail send successfully to your mail-box.');
          } else {
            this.spinnerService.hide();
            this.utilityService.showNotification('Mail Failuer!.');
          }
        }).catch(err => {
          this.spinnerService.hide();
          this.alertDialogService.show(`${err.error}`, 'Error');
        });
      }
    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public handleOtpValue(value: string) {
    this.optCode = value.trim();
  }

  public verifiedOTP() {
    try {
      if (this.optCode) {
        var item = new OTPItem();
        item.otpCode = this.optCode;
        item.token = this.token;
        item.email = this.mail;
        item.companyName = this.utilityService.getCompanyNameFromUrl(window.location.href);

        this.forgetpasswordService.OtpVerification(item).then((result) => {
          if (result.toLowerCase() == "expired" || result.toLowerCase() == "wrong") {
            this.alertDialogService.ConfirmYesNo('Your token is expired, want to reset again!', 'Token verification')
              .subscribe(async (res: any) => {
                if (res.flag)
                  this.resendOtp();
                this.router.navigate(['login']);
              });
          } else {
            this.utilityService.showNotification('Token Verification Successfully.');
            this.optCode = null as any;
            this.verifiedOTPSection();
          }
        }).catch(err => {
          this.alertDialogService.show(`${err.error}`, 'Error');
        });
      }
    } catch (error: any) {
      this.alertDialogService.show(`${error.error}`, 'Error');
    }
  }

  public resendOtp() {
    try {
      this.spinnerService.show();
      var item = new OTPItem();
      item.token = this.token;
      item.email = this.mail;
      item.companyName = this.utilityService.getCompanyNameFromUrl(window.location.href);

      this.forgetpasswordService.ResendOtp(item).then((result) => {
        if (result.toLowerCase() == "success!") {
          this.spinnerService.hide();
          this.utilityService.showNotification('Reset OTP mail send successfully to your mail-box.');
        } else {
          this.spinnerService.hide();
          this.utilityService.showNotification('Mail Failuer!.');
        }
      })
    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(`${error.error}`, 'Error');
    }
  }

  public changePasswordClick(form: NgForm) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        var resetpasswordmodel = new ResetPasswordModel();
        resetpasswordmodel.code = this.token;
        resetpasswordmodel.email = this.mail;
        resetpasswordmodel.password = form.value.passwords.password;
        resetpasswordmodel.confirmPassword = form.value.passwords.confirmPassword;
        this.forgetpasswordService.ResetPassword(resetpasswordmodel).then((result) => {
          if (result) {
            this.spinnerService.hide();
            this.alertDialogService.show(`Password Updated Successfuly`, 'Success');
            this.router.navigate(['login']);
          }
        }).catch((err) => {
          this.spinnerService.hide();
          this.alertDialogService.show(`${err.error}`, 'Error');
        });
      }
    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(`${error.error}`, 'Error');
    }
  }

  public navigateBackward(): void {
    window.history.back();
  }

}