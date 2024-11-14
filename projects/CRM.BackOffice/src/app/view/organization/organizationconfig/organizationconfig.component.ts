import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { fxCredential } from 'shared/enitites';
import { OrganizationconfigService, OrganizationService } from '../../../services';
import { AppPreloadService, UtilityService } from 'shared/services';
import { Organization, OrgConfig } from '../../../entities';
import { AlertdialogService } from 'shared/views';

@Component({
  selector: 'app-organizationconfig',
  templateUrl: './organizationconfig.component.html',
  styleUrls: ['./organizationconfig.component.css']
})

export class OrganizationconfigComponent implements OnInit {

  public organizationId!: string;
  public organizationData: Organization = new Organization();
  public orgConfig: OrgConfig = new OrgConfig();
  public tempOrgConfig: OrgConfig = new OrgConfig();
  public isEditable: boolean = false;
  public websitePattern = "(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?"
  private fxCredential!: fxCredential;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private organizationService: OrganizationService,
    private organizationConfigService: OrganizationconfigService,
    public utilityService: UtilityService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private appPreloadService: AppPreloadService) { }

  async ngOnInit() {
    await this.defaultMethods()
  }

  public async defaultMethods() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);
    this.spinnerService.show();
    await this.loadOrganizationDetail();
  }

  public async loadOrganizationDetail() {
    try {
      this.organizationId = this.route.snapshot.params.id;
      this.orgConfig = await this.organizationConfigService.getOrganizationConfigByOrgId(this.organizationId);
      if (!this.orgConfig) {
        this.orgConfig = new OrgConfig();
        this.organizationData = await this.organizationService.getOrganizationById(this.organizationId);
        this.orgConfig.organizationDNorm.id = this.organizationData.id;
        this.orgConfig.organizationDNorm.name = this.organizationData.name;
        this.orgConfig.organizationDNorm.email = this.organizationData.email;
        this.orgConfig.organizationDNorm.person = this.organizationData.person;
        this.orgConfig.organizationDNorm.phoneNo = this.organizationData.phoneNo;
      }
      this.tempOrgConfig = { ...this.orgConfig };
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public enableSaveChanges() {
    this.isEditable = true;
  }

  public disabledConfiguration() {
    this.isEditable = false;
    this.orgConfig = this.tempOrgConfig;
  }

  public async submitForPath(form: NgForm) {
    try {
      if (form.valid) {
        let message!: string;
        this.spinnerService.show();

        if (!this.orgConfig.id) {
          let responseInsert: string;
          responseInsert = await this.organizationConfigService.organizationConfigInsert(this.orgConfig);
          if (responseInsert) {
            message = "You have been Added API-Path successfully!";
            this.isEditable = false;
          }
          else
            message = "Something went wrong while adding API-Path";
        }
        else {
          let fetchOrgConfig = Object.assign({}, this.orgConfig)
          if (Object.entries(fetchOrgConfig).toString() !== Object.entries(this.tempOrgConfig).toString()) {
            let responseUpdate: boolean;
            responseUpdate = await this.organizationConfigService.organizationConfigUpdate(this.orgConfig);
            if (responseUpdate) {
              message = "You have been Updated API-Path successfully!";
              this.tempOrgConfig = { ...this.orgConfig };
              this.isEditable = false;
            }
            else
              message = "Something went wrong while updating API-Path";
          }
          else {
            message = "You have been Updated API-Path successfully!";
            this.isEditable = false;
          }
        }
        this.spinnerService.hide();
        this.utilityService.showNotification(message)
      }
      else {
        Object.keys(form.controls).forEach(key => {
          form.controls[key].markAsTouched();
        });
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

}