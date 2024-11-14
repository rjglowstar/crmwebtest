import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoneNameChangeItem } from 'projects/CRM.FrontOffice/src/app/businessobjects/common/stonenamechangeitem';
import { StoneNameResultItem } from 'projects/CRM.FrontOffice/src/app/businessobjects/common/stonenameresultitem';
import { ConfigService, listOriginItems } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import * as xlsx from 'xlsx';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {

  public originItems = listOriginItems;
  public selectedOrigin!: string;
  public pageComeFromPermission!: string
  public isPermission: boolean = false;

  private arrayBuffer: any;

  constructor(private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    public configurationService: ConfigService,) { }

  ngOnInit(): void {

  }

  // User Permission
  public rolePermissionDialog(role: string): void {
    this.selectedOrigin = role;
    this.pageComeFromPermission = "Origin";
    this.isPermission = true;
  }

  public onSelectChangeStone(files: any): void {
    try {
      this.spinnerService.show();

      let file = files[0];
      let fileReader = new FileReader();

      fileReader.onload = async (e) => {
        this.arrayBuffer = fileReader.result;
        let data = new Uint8Array(this.arrayBuffer);
        let arr = new Array();

        for (let i = 0; i != data.length; ++i)
          arr[i] = String.fromCharCode(data[i]);

        let workbook = xlsx.read(arr.join(""), { type: "binary" });
        let stoneChangeItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any;

        if (stoneChangeItems && stoneChangeItems.length > 0) {

          let stoneNameChangeitems = new Array<StoneNameChangeItem>();
          if (stoneChangeItems[0]["Old Name"]) {

            for (let i = 0; i < stoneChangeItems.length; i++) {
              let stoneChangeObj = new StoneNameChangeItem();

              stoneChangeObj.oldName = stoneChangeItems[i]["Old Name"].trim();
              stoneChangeObj.newName = stoneChangeItems[i]["New Name"].trim();
              stoneNameChangeitems.push(stoneChangeObj);
            }
          }

          var result = await this.configurationService.stoneNameChange(stoneNameChangeitems);
          if (result && result.length <= 0) {
            this.spinnerService.hide();
            this.alertDialogService.show("Successfully Change Names", "Configuration");
          }
          else {
            this.spinnerService.hide();
            this.alertDialogService.show(result.map(c => c.stoneId).toString(), "Configuration");
          }
        }
      }

      fileReader.readAsArrayBuffer(file);
      this.spinnerService.hide();
    }
    catch (error) {
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public onSelectChangeKapan(files: any): void {
    try {
      this.spinnerService.show();

      let kapanNames = new Array<string>();
      var results = new Array<StoneNameResultItem>();

      let file = files[0];
      let fileReader = new FileReader();

      fileReader.onload = async (e) => {
        this.arrayBuffer = fileReader.result;
        let data = new Uint8Array(this.arrayBuffer);
        let arr = new Array();

        for (let i = 0; i != data.length; ++i)
          arr[i] = String.fromCharCode(data[i]);

        let workbook = xlsx.read(arr.join(""), { type: "binary" });
        let kapanItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any;

        if (kapanItems && kapanItems.length > 0) {


          if (kapanItems[0]["KapanName"]) {

            for (let i = 0; i < kapanItems.length; i++)
              kapanNames.push(kapanItems[i]["KapanName"].trim());
          }


          // Hide temporary
          // var invItems = await this.configurationService.changeKapanSoldStone(kapanNames);
          // if (invItems && invItems.length > 0) {
          //   for (let i = 0; i < kapanNames.length; i++) {

          //     var stoneChangeItems = new Array<StoneNameChangeItem>();

          //     var invList = invItems.filter(c => c.kapan == kapanNames[i]);
          //     if (invList && invList.length > 0) {
          //       invList.forEach(element => {
          //         var obj = new StoneNameChangeItem();
          //         obj.oldName = element.stoneId;
          //         obj.newName = "CK" + element.stoneId;
          //         stoneChangeItems.push(obj);
          //       });

          //       var result = await this.configurationService.stoneNameChange(stoneChangeItems);
          //       if (result && result.length > 0) {
          //         results = results.concat(result);
          //       }
          //     }
          //   }
          // }
          //Hide Temprorary upato here


          var flag = await this.configurationService.changeWeeklySummaryKapan(kapanNames);
          if (flag) {
            this.spinnerService.hide();
            this.alertDialogService.show("Successfully Change Name", "Configuration");
          }


        }
      }

      fileReader.readAsArrayBuffer(file);
      this.spinnerService.hide();

      //Temporary Hide
      // if (results && results.length > 0)
      //   this.alertDialogService.show(results.map(c => c.stoneId).toString(), "Problem Occure to this Stone.!");
      // else
      //   this.alertDialogService.show("Successfully change the Name", "Configuration");

      //Temporary Hide upto Here

    }
    catch (error) {
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

}
