import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PanelBarExpandMode } from "@progress/kendo-angular-layout";
import { NgxSpinnerService } from 'ngx-spinner';
import { CutDetailDNorm, FancyCutDetailDNorm, fxCredential, GirdlePerDetailDnorm, InclusionConfig, MasterConfig, MasterConfigType, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { listShapeItems, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { MasterConfigService } from '../../services';

@Component({
  selector: 'app-masterconfig',
  templateUrl: './masterconfig.component.html',
  styleUrls: ['./masterconfig.component.css']
})
export class MasterconfigComponent implements OnInit {

  public labData: MasterDNorm[] = [];
  public shapeData: MasterDNorm[] = [];
  public colorsData: MasterDNorm[] = [];
  public claritiesData: MasterDNorm[] = [];
  public cpsData: MasterDNorm[] = [];
  public fluorescenceData: MasterDNorm[] = [];
  public cutData: MasterDNorm[] = [];
  public cutDetailDNormData: CutDetailDNorm[] = [];
  public newCutDetailDNormData: CutDetailDNorm[] = [];
  public masterConfigSingleObj: MasterConfig = new MasterConfig();
  public labDNormObj: MasterDNorm = new MasterDNorm();
  public masterDNormObj: MasterDNorm = new MasterDNorm();
  public cutDetailDNormObj: CutDetailDNorm = new CutDetailDNorm();
  public fancyCutDetailDNormData: FancyCutDetailDNorm[] = [];
  public fancyCutDetailDNormObj: FancyCutDetailDNorm = new FancyCutDetailDNorm();
  public insertFlag = true;
  public masterFlag?: string;
  public optionalword: string = '';
  public listCPSData: string[] = [];
  public listShapeData: string[] = listShapeItems;
  public listFancyCutShapeItems: string[] = [];
  public listCutData: string[] = [];
  public isMasterToggle: boolean = false;
  public isCutDetailsToggle: boolean = false;
  public isFancyCutToggle: boolean = false;
  public isLabToggle: boolean = false;
  public expandMode: number = PanelBarExpandMode.Single;
  // Inclusion &  Measurement
  public isInclusionToggle: boolean = false;
  public isMeasurementToggle: boolean = false;
  public dialogTitle: string = '';
  public inclusionData: MasterDNorm[] = [];
  public inclusionFlag: boolean = false;
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public measurementData: MasterDNorm[] = [];
  public gridleData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  public errDepth: string = '';
  public errTable: string = '';
  public errGirdle: string = '';
  public errRation: string = '';
  private fxCredential!: fxCredential;
  public isViewButtons: boolean = false;

  public girdlePerDetailDnormData: GirdlePerDetailDnorm[] = [];
  public girdlePerDetailDnormObj: GirdlePerDetailDnorm = new GirdlePerDetailDnorm();
  public listGirdlePerCutShapeItems: string[] = [];
  public isGirdlePerToggle: boolean = false;

  constructor(
    private router: Router,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private masterConfigService: MasterConfigService,
    private spinnerService: NgxSpinnerService
  ) { }

  async ngOnInit() {
    this.spinnerService.show();
    await this.defaultMethodsLoad();
  }

  //#region Init Data
  async defaultMethodsLoad() {
    try {
      this.fxCredential = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      if (!this.fxCredential)
        this.router.navigate(["login"]);

      if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin'))
        this.isViewButtons = true;

      this.masterConfigSingleObj = await this.masterConfigService.getAllMasterConfig();
      if (this.masterConfigSingleObj) {
        this.labData = this.masterConfigSingleObj.lab;
        this.shapeData = this.utilityService.sortingMasterDNormPriority(this.masterConfigSingleObj.shape);
        this.colorsData = this.utilityService.sortingMasterDNormPriority(this.masterConfigSingleObj.colors);
        this.claritiesData = this.utilityService.sortingMasterDNormPriority(this.masterConfigSingleObj.clarities);
        this.cpsData = this.utilityService.sortingMasterDNormPriority(this.masterConfigSingleObj.cps);
        this.fluorescenceData = this.utilityService.sortingMasterDNormPriority(this.masterConfigSingleObj.fluorescence);
        this.cutData = this.utilityService.sortingMasterDNormPriority(this.masterConfigSingleObj.cut);
        this.cutDetailDNormData = this.masterConfigSingleObj.cutDetails;
        this.fancyCutDetailDNormData = this.masterConfigSingleObj.fancyCutDetails;        

        this.girdlePerDetailDnormData = this.masterConfigSingleObj.girdlePerDetails;
        this.inclusionData = this.utilityService.sortingMasterDNormPriority(this.masterConfigSingleObj.inclusions);
        this.inclusionConfig = this.masterConfigSingleObj.inclusionConfig;
        this.measurementData = this.utilityService.sortingMasterDNormPriority(this.masterConfigSingleObj.measurements);
        this.gridleData = this.measurementData.filter((item) => item.type.toLowerCase() == "girdle");
        this.measurementConfig = this.masterConfigSingleObj.measurementConfig;

        this.listCPSData = [];
        this.listCutData = [];

        this.cpsData.forEach(z => { this.listCPSData.push(z.name); });
        this.cutData.forEach(z => { this.listCutData.push(z.name); });
        this.shapeData.forEach(z => { this.listFancyCutShapeItems.push(z.name); });
        this.shapeData.forEach(z => { this.listGirdlePerCutShapeItems.push(z.name); });

        this.spinnerService.hide();
      }
      else {
        this.masterConfigSingleObj = new MasterConfig();
        this.masterConfigSingleObj.id = '0';
        this.spinnerService.hide();
      }

    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }

  }

  //#endregion

  //#region MasterDNorm CRUD
  public async onMasterDNormSubmit(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        if (this.checkDuplicateName()) {
          this.alertDialogService.show(`Name already exists`);
          return;
        }
        if (this.checkDuplicatePriority()) {
          this.alertDialogService.show(`Priority already exists`);
          return;
        }
        this.spinnerService.show();
        let messageType: string = "";
        let response = false;
        if (!this.insertFlag) {
          messageType = "updated";
          switch (this.masterFlag?.toLowerCase()) {
            case "lab":
              response = await this.masterConfigService.updateLab(this.labDNormObj);
              break;
            case "shape":
              response = await this.masterConfigService.updateShape(this.masterDNormObj);
              break;
            case "color":
              response = await this.masterConfigService.updateColors(this.masterDNormObj);
              break;
            case "clarities":
              response = await this.masterConfigService.updateClarities(this.masterDNormObj);
              break;
            case "cps":
              response = await this.masterConfigService.updateCPS(this.masterDNormObj);
              break;
            case "fluorescence":
              response = await this.masterConfigService.updateFluorescence(this.masterDNormObj);
              break;
            case "cut":
              response = await this.masterConfigService.updateCut(this.masterDNormObj);
              break;
          }
        }
        else {
          messageType = "registered";
          switch (this.masterFlag?.toLowerCase()) {
            case "lab":
              response = await this.masterConfigService.insertLab(this.labDNormObj);
              break;
            case "shape":
              response = await this.masterConfigService.insertShape(this.masterDNormObj);
              break;
            case "color":
              response = await this.masterConfigService.insertColors(this.masterDNormObj);
              break;
            case "clarities":
              response = await this.masterConfigService.insertClarities(this.masterDNormObj);
              break;
            case "cps":
              response = await this.masterConfigService.insertCPS(this.masterDNormObj);
              break;
            case "fluorescence":
              response = await this.masterConfigService.insertFluorescence(this.masterDNormObj);
              break;
            case "cut":
              response = await this.masterConfigService.insertCut(this.masterDNormObj);
              break;
          }
        }

        if (response) {
          sessionStorage.removeItem("MasterConfig");
          this.spinnerService.hide();
          this.defaultMethodsLoad();
          if (action) {
            if (this.masterFlag == 'Lab')
              this.isLabToggle = false;
            else
              this.isMasterToggle = false;

            if (this.isInclusionToggle)
              this.isInclusionToggle = false;
          }
          this.resetForm(form);
          this.utilityService.showNotification(`Data have been ${messageType} successfully!`);
        }
        else {
          this.spinnerService.hide();
          this.alertDialogService.show(`Something went wrong, Try again later.`);
        }
      }
      else {
        this.spinnerService.hide();
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

  public onMasterDNormUpdate(selectedItem: MasterDNorm, flag: string): void {
    this.masterFlag = flag;
    this.insertFlag = false;
    if (flag == 'Lab') {
      this.labDNormObj = { ...selectedItem };
      this.isLabToggle = true;
    }
    else {
      this.masterDNormObj = { ...selectedItem };
      this.isMasterToggle = true;
    }
  }

  public async onMasterDNormDelete(selectedItem: MasterDNorm, masterFlag: string) {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = false;

            switch (masterFlag?.toLowerCase()) {
              case "lab":
                responseDelete = await this.masterConfigService.deleteLab(selectedItem.id);
                break;
              case "shape":
                responseDelete = await this.masterConfigService.deleteShape(selectedItem.id);
                break;
              case "color":
                responseDelete = await this.masterConfigService.deleteColors(selectedItem.id);
                break;
              case "clarities":
                responseDelete = await this.masterConfigService.deleteClarities(selectedItem.id);
                break;
              case "cps":
                responseDelete = await this.masterConfigService.deleteCPS(selectedItem.id);
                break;
              case "fluorescence":
                responseDelete = await this.masterConfigService.deleteFluorescence(selectedItem.id);
                break;
              case "cut":
                responseDelete = await this.masterConfigService.deleteCut(selectedItem.id);
                break;
            }

            if (responseDelete) {
              sessionStorage.removeItem("MasterConfig");
              this.defaultMethodsLoad();
              this.spinnerService.hide();
              this.utilityService.showNotification(`Data have been deleted successfully!`)
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show(`Something went wrong, Try again later.`);
            }
          }
        })
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region CutDetailDNorm CRUD
  public onAddoptionalWordDNormAdd(optionalWords: string) {
    if (this.checkAddoptionalWordValidation()) {
      this.alertDialogService.show(`This optional word already exists`);
      return;
    }
    optionalWords = optionalWords.trim();
    if (optionalWords.length > 0)
      this.masterDNormObj.optionalWords.push(optionalWords);
    this.optionalword = '';
  }

  public removeAddoptionalWordDNorm(i: number) {
    this.masterDNormObj.optionalWords.splice(i, 1);
  }

  public onCutDetailDNormAdd(form: NgForm) {
    if (form.valid) {
      if (this.checkCutDetailDuplicateValidation()) {
        this.alertDialogService.show(`This cut detail already exists`);
        return;
      }

      this.newCutDetailDNormData.push(this.cutDetailDNormObj);
      this.cutDetailDNormObj = new CutDetailDNorm();
      form.reset();
    }
  }

  public removeCutDetailDNorm(i: number) {
    this.newCutDetailDNormData.splice(i, 1);
  }

  public async onCutDetailDNormSubmit(action: boolean) {
    try {
      if (this.newCutDetailDNormData && this.newCutDetailDNormData.length > 0) {
        this.spinnerService.show();
        let response = await this.masterConfigService.insertCutDetails(this.newCutDetailDNormData);

        if (response) {
          sessionStorage.removeItem("MasterConfig");
          this.spinnerService.hide();
          this.defaultMethodsLoad();
          if (action)
            this.isCutDetailsToggle = false;
          this.resetForm();
          this.utilityService.showNotification(`Cut Detail have been added successfully!`);
        }
        else {
          this.spinnerService.hide();
          this.alertDialogService.show(`Something went wrong, Try again later.`);
        }
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async onCutDetailDNormDelete(selectedItem: CutDetailDNorm) {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = await this.masterConfigService.deleteCutDetails(selectedItem.id);

            if (responseDelete !== undefined && responseDelete !== null && responseDelete) {
              sessionStorage.removeItem("MasterConfig");
              this.defaultMethodsLoad();
              this.spinnerService.hide();
              this.utilityService.showNotification(`Data have been deleted successfully!`)
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show(`Something went wrong, Try again later.`);
            }
          }
        })
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region Fancy Cut Detail CRUD
  public onFancyCutDetailDNormEdit(selectedItem: FancyCutDetailDNorm): void {
    this.insertFlag = false;
    this.fancyCutDetailDNormObj = { ...selectedItem };
    this.openFancyCutdetailsDialog();
  }

  public async onFancyCutDNormSubmit(action: boolean) {
    try {
      let exists = this.fancyCutDetailDNormData.find(z => z.shape == this.fancyCutDetailDNormObj.shape && z.cut == this.fancyCutDetailDNormObj.cut && z.id != this.fancyCutDetailDNormObj.id);
      if (exists != null) {
        this.alertDialogService.show(`This fancy cut detail already exists!`);
        return;
      }

      let girdleAll = this.measurementData.filter(item => item.type.toLowerCase().indexOf('girdle') !== -1);
      let minP = girdleAll.find(z => z.name == this.fancyCutDetailDNormObj.minGirdle)?.priority;
      let maxP = girdleAll.find(z => z.name == this.fancyCutDetailDNormObj.maxGirdle)?.priority;
      this.fancyCutDetailDNormObj.minGirdlePriority = parseInt(minP ?? '0');
      this.fancyCutDetailDNormObj.maxGirdlePriority = parseInt(maxP ?? '0');

      this.spinnerService.show();
      let response = false;
      if (this.insertFlag)
        response = await this.masterConfigService.insertFancyCutDetails(this.fancyCutDetailDNormObj);
      else
        response = await this.masterConfigService.updateFancyCut(this.fancyCutDetailDNormObj);

      if (response) {
        sessionStorage.removeItem("MasterConfig");
        this.spinnerService.hide();
        this.defaultMethodsLoad();
        if (action)
          this.closeFancyCutDialog();
        this.resetForm();
        this.utilityService.showNotification(`Fancy Cut Detail have been added successfully!`);
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show(`Something went wrong, Try again later.`);
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async onFancyCutDetailDNormDelete(selectedItem: FancyCutDetailDNorm) {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            let responseDelete = await this.masterConfigService.deleteFancyCutDetails(selectedItem.id);

            if (responseDelete !== undefined && responseDelete !== null && responseDelete) {
              sessionStorage.removeItem("MasterConfig");
              this.defaultMethodsLoad();
              this.spinnerService.hide();
              this.utilityService.showNotification(`Data have been deleted successfully!`)
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show(`Something went wrong, Try again later.`);
            }
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show(`Something went wrong, Try again later.`);
          }
        }
      });
  }
  //#endregion

  //#region Girdle Per Detail CRUD
  public onGirdlePerDetailsDNormEdit(selectedItem: GirdlePerDetailDnorm): void {
    this.insertFlag = false;
    this.girdlePerDetailDnormObj = { ...selectedItem };
    this.openGirdlePerDetailsDialog();
  }

  public async onGirdlePerDetailsDNormSubmit(action: boolean) {    
    try {
      let exists = this.girdlePerDetailDnormData.find(z => z.shape == this.girdlePerDetailDnormObj.shape && z.name == this.girdlePerDetailDnormObj.name && z.id != this.girdlePerDetailDnormObj.id);
      if (exists != null) {
        this.alertDialogService.show(`This Girdle Per detail already exists!`);
        return;
      }

      this.spinnerService.show();
      let response = false;
      if (this.insertFlag)
        response = await this.masterConfigService.insertGirdlePerDetails(this.girdlePerDetailDnormObj);
      else
        response = await this.masterConfigService.updateGirdlePer(this.girdlePerDetailDnormObj);

      if (response) {
        sessionStorage.removeItem("MasterConfig");
        this.spinnerService.hide();
        this.defaultMethodsLoad();
        if (action)
          this.closeGirdlePerDetailsDialog();
        this.resetForm();
        this.utilityService.showNotification(`Girdle Per Detail have been added successfully!`);
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show(`Something went wrong, Try again later.`);
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async onGirdlePerDetailsDNormDelete(selectedItem: GirdlePerDetailDnorm) {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            let responseDelete = await this.masterConfigService.deleteGirdlePerDetails(selectedItem.id);

            if (responseDelete !== undefined && responseDelete !== null && responseDelete) {
              sessionStorage.removeItem("MasterConfig");
              this.defaultMethodsLoad();
              this.spinnerService.hide();
              this.utilityService.showNotification(`Data have been deleted successfully!`)
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show(`Something went wrong, Try again later.`);
            }
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show(`Something went wrong, Try again later.`);
          }
        }
      });
  }
  //#endregion

  //#region OnChange Functions
  public resetForm(form?: NgForm) {
    this.labDNormObj = new MasterDNorm();
    this.masterDNormObj = new MasterDNorm();
    this.cutDetailDNormObj = new CutDetailDNorm();
    this.fancyCutDetailDNormObj = new FancyCutDetailDNorm();
    this.girdlePerDetailDnormObj = new GirdlePerDetailDnorm();
    this.insertFlag = true;
    this.newCutDetailDNormData = [];
    form?.reset();
  }

  public openMasterDNormDialog(flag: string): void {
    this.isMasterToggle = true;
    this.masterFlag = flag;
  }

  public closeMasterDNormDialog(): void {
    this.isMasterToggle = false;
    this.resetForm();
  }

  public openCutdetailsDialog(): void {
    this.isCutDetailsToggle = true;
  }

  public closeCutdetailsDialog(): void {
    this.isCutDetailsToggle = false;
    this.resetForm();
  }

  public openFancyCutdetailsDialog(): void {
    this.isFancyCutToggle = true;
  }

  public closeFancyCutDialog(): void {
    this.isFancyCutToggle = false;
    this.resetForm();
  }

  public openGirdlePerDetailsDialog(): void {
    this.isGirdlePerToggle = true;
  }

  public closeGirdlePerDetailsDialog(): void {
    this.isGirdlePerToggle = false;
    this.resetForm();
  }

  public openLabDialog(): void {
    this.isLabToggle = true;
    this.masterFlag = 'Lab';
  }

  public closeLabDialog(): void {
    this.isLabToggle = false;
    this.resetForm();
  }

  public checkDuplicateName() {
    let flag = false;

    if (this.insertFlag) {
      switch (this.masterFlag?.toLowerCase()) {
        case "lab":
          flag = this.labData.some(z => z.name == this.masterDNormObj.name);
          break;
        case "shape":
          flag = this.shapeData.some(z => z.name == this.masterDNormObj.name);
          break;
        case "color":
          flag = this.colorsData.some(z => z.name == this.masterDNormObj.name);
          break;
        case "clarities":
          flag = this.claritiesData.some(z => z.name == this.masterDNormObj.name);
          break;
        case "cps":
          flag = this.cpsData.some(z => z.name == this.masterDNormObj.name);
          break;
        case "fluorescence":
          flag = this.fluorescenceData.some(z => z.name == this.masterDNormObj.name);
          break;
        case "cut":
          flag = this.cutData.some(z => z.name == this.masterDNormObj.name);
          break;
      }
    }
    else {
      switch (this.masterFlag?.toLowerCase()) {
        case "lab":
          flag = this.labData.some(z => z.name == this.masterDNormObj.name && z.id != this.masterDNormObj.id);
          break;
        case "shape":
          flag = this.shapeData.some(z => z.name == this.masterDNormObj.name && z.id != this.masterDNormObj.id);
          break;
        case "color":
          flag = this.colorsData.some(z => z.name == this.masterDNormObj.name && z.id != this.masterDNormObj.id);
          break;
        case "clarities":
          flag = this.claritiesData.some(z => z.name == this.masterDNormObj.name && z.id != this.masterDNormObj.id);
          break;
        case "cps":
          flag = this.cpsData.some(z => z.name == this.masterDNormObj.name && z.id != this.masterDNormObj.id);
          break;
        case "fluorescence":
          flag = this.fluorescenceData.some(z => z.name == this.masterDNormObj.name && z.id != this.masterDNormObj.id);
          break;
        case "cut":
          flag = this.cutData.some(z => z.name == this.masterDNormObj.name && z.id != this.masterDNormObj.id);
          break;
      }
    }

    return flag;
  }

  public checkDuplicatePriority() {
    let flag = false;

    if (this.insertFlag) {
      switch (this.masterFlag?.toLowerCase()) {
        case "shape":
          flag = this.shapeData.some(z => z.priority == this.masterDNormObj.priority);
          break;
        case "color":
          flag = this.colorsData.some(z => z.priority == this.masterDNormObj.priority);
          break;
        case "clarities":
          flag = this.claritiesData.some(z => z.priority == this.masterDNormObj.priority);
          break;
        case "cps":
          flag = this.cpsData.some(z => z.priority == this.masterDNormObj.priority);
          break;
        case "fluorescence":
          flag = this.fluorescenceData.some(z => z.priority == this.masterDNormObj.priority);
          break;
        case "cut":
          flag = this.cutData.some(z => z.priority == this.masterDNormObj.priority);
          break;
      }
    }
    else {
      switch (this.masterFlag?.toLowerCase()) {
        case "shape":
          flag = this.shapeData.some(z => z.priority == this.masterDNormObj.priority && z.id != this.masterDNormObj.id);
          break;
        case "color":
          flag = this.colorsData.some(z => z.priority == this.masterDNormObj.priority && z.id != this.masterDNormObj.id);
          break;
        case "clarities":
          flag = this.claritiesData.some(z => z.priority == this.masterDNormObj.priority && z.id != this.masterDNormObj.id);
          break;
        case "cps":
          flag = this.cpsData.some(z => z.priority == this.masterDNormObj.priority && z.id != this.masterDNormObj.id);
          break;
        case "fluorescence":
          flag = this.fluorescenceData.some(z => z.priority == this.masterDNormObj.priority && z.id != this.masterDNormObj.id);
          break;
        case "cut":
          flag = this.cutData.some(z => z.priority == this.masterDNormObj.priority && z.id != this.masterDNormObj.id);
          break;
      }
    }

    return flag;
  }

  public checkCutDetailDuplicateValidation() {
    let flag = false;

    flag = this.cutDetailDNormData.some(z => z.shape == this.cutDetailDNormObj.shape && z.cut == this.cutDetailDNormObj.cut && z.polish == this.cutDetailDNormObj.polish && z.symmetry == this.cutDetailDNormObj.symmetry);
    if (!flag)
      flag = this.newCutDetailDNormData.some(z => z.shape == this.cutDetailDNormObj.shape && z.cut == this.cutDetailDNormObj.cut && z.polish == this.cutDetailDNormObj.polish && z.symmetry == this.cutDetailDNormObj.symmetry);

    return flag;
  }

  public checkAddoptionalWordValidation() {
    let flag = false;
    flag = this.masterDNormObj.optionalWords.some(z => z == this.optionalword?.toLowerCase());

    return flag;
  }
  //#endregion

  //#region Inclusion Bar
  public openPlanParamDialog(paramName: string): void {
    this.masterFlag = paramName;
    this.isInclusionToggle = true;
    this.dialogTitle = paramName;
    this.masterDNormObj = new MasterDNorm();
  }

  public closePlanParamDialog(paramName: string): void {
    this.isInclusionToggle = false;
    this.resetForm();
  }

  public onMasterDNormEditInclusion(selectedItem: MasterDNorm, flag: string): void {
    this.dialogTitle = flag;
    this.masterFlag = flag;
    this.insertFlag = false;
    this.masterDNormObj = { ...selectedItem };
    this.isInclusionToggle = true;
  }

  public onMasterDNormDeleteInclusion(selectedItem: MasterDNorm, flag: string): void {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = false;
            responseDelete = await this.masterConfigService.deleteInclusion(selectedItem.id);
            if (responseDelete) {
              sessionStorage.removeItem("MasterConfig");
              this.defaultMethodsLoad();
              this.isInclusionToggle = false;
              this.spinnerService.hide();
              this.insertFlag = false;
              this.utilityService.showNotification(`Data have been deleted successfully!`)
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show(`Something went wrong, Try again later.`);
            }
          }
        })
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async onInclusionSubmit(form: NgForm, action: boolean) {
    try {
      if (this.masterFlag?.toLowerCase() == "girdle") {
        this.onMeasurementSubmit(form, action)
      }
      else {
        if (form.valid) {
          if (this.checkInclusionName()) {
            this.alertDialogService.show(`Name is already exists`);
            return;
          }
          if (this.checkInclusionPriority()) {
            this.alertDialogService.show(`Priority is already exists`);
            return;
          }
          this.spinnerService.show();
          let messageType: string = "";
          let response = false;
          if (!this.insertFlag) {
            messageType = "updated";
            response = await this.masterConfigService.updateInclusion(this.masterDNormObj);
          }
          else {
            messageType = "registered";
            if (this.masterFlag)
              this.masterDNormObj.type = this.masterFlag.toLowerCase();
            response = await this.masterConfigService.insertInclusion(this.masterDNormObj);
          }

          if (response) {
            sessionStorage.removeItem("MasterConfig");
            this.spinnerService.hide();
            this.defaultMethodsLoad();
            if (action) {
              if (this.isInclusionToggle)
                this.isInclusionToggle = false;
            }
            this.resetForm(form);
            this.utilityService.showNotification(`Data have been ${messageType} successfully!`);
          }
          else {
            this.spinnerService.hide();
            this.alertDialogService.show(`Something went wrong, Try again later.`);
          }
        }
        else {
          this.spinnerService.hide();
          Object.keys(form.controls).forEach(key => {
            form.controls[key].markAsTouched();
          });
        }
      }

    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public checkInclusionName() {
    let flag = false;
    if (this.insertFlag)
      flag = this.inclusionData.some(z => z.name.toLowerCase() == this.masterDNormObj.name.toLowerCase() && z.type.toLowerCase() == this.masterFlag?.toLowerCase());
    else {
      flag = this.inclusionData.some(z => z.name.toLowerCase() == this.masterDNormObj.name.toLowerCase() && z.id != this.masterDNormObj.id && z.type.toLowerCase() == this.masterFlag?.toLowerCase());
    }
    return flag;
  }

  public checkInclusionPriority() {
    let flag = false;
    if (this.insertFlag)
      flag = this.inclusionData.some(z => z.priority == this.masterDNormObj.priority && z.type.toLowerCase() == this.masterFlag?.toLowerCase());
    else {
      flag = this.inclusionData.some(z => z.priority == this.masterDNormObj.priority && z.id != this.masterDNormObj.id && z.type.toLowerCase() == this.masterFlag?.toLowerCase());
    }
    return flag;
  }

  public checkInclusionTypeLength(type: string) {
    let flag = false;
    flag = this.inclusionData.some(z => z.type.toLowerCase() == type.toLowerCase());
    return flag;
  }

  public async isActiveInclusion(type: string, isActive: boolean) {
    try {
      let value: string = isActive ? "enabled" : "disable";
      this.alertDialogService.ConfirmYesNo("Are you sure you want to " + value + "?", "Active Inventory")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            let flag = false;
            let inclusionType = new MasterConfigType();

            inclusionType.type = type;
            inclusionType.isActive = isActive
            flag = await this.masterConfigService.updateActiveInclusion(inclusionType);
            if (flag) {
              sessionStorage.removeItem("MasterConfig");
              this.defaultMethodsLoad();
            }
          }
          else {
            this.inclusionConfig = this.masterConfigSingleObj.inclusionConfig;
            let tempIConfig: any = this.inclusionConfig;
            Object.entries(tempIConfig).forEach(([key, value]) => {
              if (key.toLowerCase() == type.toLowerCase()) {
                tempIConfig[key] = !isActive;
              }
            });
            this.inclusionConfig = tempIConfig;
          }
          this.spinnerService.hide();

        })
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);

    }
  }

  //#endregion

  //#region Measurement Bar
  public onMasterDNormEditMeasurement(selectedItem: MasterDNorm, flag: string): void {
    this.dialogTitle = flag;
    this.masterFlag = flag;
    this.insertFlag = false;
    this.masterDNormObj = { ...selectedItem };
    this.isInclusionToggle = true;
  }

  public onMasterDNormDeleteMeasurement(selectedItem: MasterDNorm, flag: string): void {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = false;
            responseDelete = await this.masterConfigService.deleteMeasurement(selectedItem.id);
            if (responseDelete) {
              sessionStorage.removeItem("MasterConfig");
              this.defaultMethodsLoad();
              this.isInclusionToggle = false;
              this.spinnerService.hide();
              this.insertFlag = false;
              this.utilityService.showNotification(`Data have been deleted successfully!`)
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show(`Something went wrong, Try again later.`);
            }
          }
        })
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async onMeasurementSubmit(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        if (this.checkMeasurementName()) {
          this.alertDialogService.show(`Name is already exists`);
          return;
        }
        if (this.checkMeasurementPriority()) {
          this.alertDialogService.show(`Priority is already exists`);
          return;
        }
        this.spinnerService.show();
        let messageType: string = "";
        let response = false;
        if (!this.insertFlag) {
          messageType = "updated";
          response = await this.masterConfigService.updateMeasurement(this.masterDNormObj);
        }
        else {
          messageType = "registered";
          if (this.masterFlag)
            this.masterDNormObj.type = this.masterFlag.toLowerCase();
          response = await this.masterConfigService.insertMeasurement(this.masterDNormObj);
        }

        if (response) {
          sessionStorage.removeItem("MasterConfig");
          this.spinnerService.hide();
          this.defaultMethodsLoad();
          if (action) {
            if (this.isInclusionToggle)
              this.isInclusionToggle = false;
          }
          this.resetForm(form);
          this.utilityService.showNotification(`Data have been ${messageType} successfully!`);
        }
        else {
          this.spinnerService.hide();
          this.alertDialogService.show(`Something went wrong, Try again later.`);
        }
      }
      else {
        this.spinnerService.hide();
        Object.keys(form.controls).forEach(key => {
          form.controls[key].markAsTouched();
        });
      }

    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public checkMeasurementName() {
    let flag = false;
    if (this.insertFlag)
      flag = this.measurementData.some(z => z.name.toLowerCase() == this.masterDNormObj.name.toLowerCase() && z.type.toLowerCase() == this.masterFlag?.toLowerCase());
    else {
      flag = this.measurementData.some(z => z.name.toLowerCase() == this.masterDNormObj.name.toLowerCase() && z.id != this.masterDNormObj.id && z.type.toLowerCase() == this.masterFlag?.toLowerCase());
    }
    return flag;
  }

  public checkMeasurementPriority() {
    let flag = false;
    if (this.insertFlag)
      flag = this.measurementData.some(z => z.priority == this.masterDNormObj.priority && z.type.toLowerCase() == this.masterFlag?.toLowerCase());
    else {
      flag = this.measurementData.some(z => z.priority == this.masterDNormObj.priority && z.id != this.masterDNormObj.id && z.type.toLowerCase() == this.masterFlag?.toLowerCase());
    }
    return flag;
  }

  public checkMeasurementTypeLength(type: string) {
    let flag = false;
    flag = this.measurementData.some(z => z.type.toLowerCase() == type.toLowerCase());
    return flag;
  }

  public async isActiveMeasurement(type: string, isActive: boolean) {
    try {
      let value: string = isActive ? "enabled" : "disable";
      this.alertDialogService.ConfirmYesNo("Are you sure you want to " + value + "?", "Active Measurement")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            let flag = false;
            let measurementType = new MasterConfigType();
            measurementType.type = type;
            measurementType.isActive = isActive
            flag = await this.masterConfigService.updateActiveMeasurement(measurementType);
            if (flag) {
              sessionStorage.removeItem("MasterConfig");
              this.defaultMethodsLoad();
            }
          }
          else {
            this.measurementConfig = this.masterConfigSingleObj.measurementConfig;
            let tempMConfig: any = this.measurementConfig;
            Object.entries(tempMConfig).forEach(([key, value]) => {
              if (key.toLowerCase() == type.toLowerCase()) {
                tempMConfig[key] = !isActive;
              }
            });
            this.measurementConfig = tempMConfig;
          }
          this.spinnerService.hide();

        })
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);

    }
  }



  //#endregion
}