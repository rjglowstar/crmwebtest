import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { ContactUsDetail } from '../../businessobjects';
import { ContactUs } from '../../entities';
import { ContactUsService } from '../../services';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrl: './contactus.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ContactusComponent implements OnInit {

  public isLogin: boolean = false;

  public contactObj: ContactUs = new ContactUs();
  public contactUsDetail: ContactUsDetail = new ContactUsDetail();

  constructor(
    public utilityService: UtilityService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private contactUsService: ContactUsService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.contactUsDetail = this.utilityService.getContactUsDetails(window.location.href);

    this.isLogin = sessionStorage.getItem("userToken") ? true : false;
  }

  public async onSubmit(form: NgForm) {
    try {
      if (!form.valid)
        return;

      Object.keys(form.controls).forEach(key => {
        if (form.controls[key]?.value) {
          form.controls[key].setValue(form.controls[key]?.value.trim());
        }
      });

      let isEmailValid = this.checkValidEmail(this.contactObj.email);
      if (!isEmailValid) {
        this.alertDialogService.show('Not valid email address in Mail To');
        return;
      }

      if (form.valid) {
        this.spinnerService.show();
        this.contactObj.from = (window.location.href.toLowerCase().includes("diamarthk")) ? 'diamarthk' : ((window.location.href.toLowerCase().includes("glowstaronline")) ? 'glowstar' : 'diamanto');
        let response = await this.contactUsService.insertContactUs(this.contactObj);
        if (response) {
          this.contactObj = new ContactUs();
          this.spinnerService.hide();
          this.utilityService.showNotification(`Thank you for contacting us! Your inquiry has been received and we will do our best to respond to you promptly.`)
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



  public checkValidEmail(email: string): boolean {
    let flag = true;
    if (email && email.length > 0) {
      let emailArray = email.split(",");
      if (emailArray && emailArray.length > 0) {
        emailArray.forEach(z => {
          if (flag)
            flag = this.validateEmail(z.trim());
        });
      }
    }
    return flag;
  }


  public validateEmail(email: string): boolean {
    let regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return regexp.test(email);
  }
  
  getGoogleMapsUrlWithAddress(address: string): SafeResourceUrl {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }


}
