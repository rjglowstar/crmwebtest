import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RFIDClass, StockTallyBox } from '../../../../entities';
import { StocktallyService } from '../../../../services';
import { RFIDCLASSExportFields, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { StockTallyBoxSearchCritria } from '../../../../businessobjects';

@Component({
  selector: 'app-rfidstocktallybox',
  templateUrl: './rfidstocktallybox.component.html',
  styleUrls: ['./rfidstocktallybox.component.css']
})
export class RfidstocktallyboxComponent implements OnInit {
  @Output() public toggle = new EventEmitter<boolean>();

  public rfidStockTallyBoxCriteria = new StockTallyBoxSearchCritria();
  public stockTallyBoxList: Array<StockTallyBox> = new Array<StockTallyBox>();

  constructor(public utilityService: UtilityService,
    private stockTallyService: StocktallyService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,) { }

  ngOnInit(): void {
  }

  public async searchTallyBox() {
    try {
      this.spinnerService.show();

      if (this.rfidStockTallyBoxCriteria && this.rfidStockTallyBoxCriteria.fromDate && this.rfidStockTallyBoxCriteria.toDate) {
        this.rfidStockTallyBoxCriteria.fromDate = this.utilityService.setUTCDateFilter(this.rfidStockTallyBoxCriteria.fromDate);
        this.rfidStockTallyBoxCriteria.toDate = this.utilityService.setUTCDateFilter(this.rfidStockTallyBoxCriteria.toDate);
      }

      this.stockTallyBoxList = await this.stockTallyService.getStockTallyBoxFiltered(this.rfidStockTallyBoxCriteria);
      this.spinnerService.hide();

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public clearStockTallyBox() {
    this.stockTallyBoxList = new Array<StockTallyBox>();
    this.rfidStockTallyBoxCriteria = new StockTallyBoxSearchCritria();
  }

  /* #region Export excel sections */
  public async exportToExcel(rfidItems: Array<RFIDClass>) {
    this.alertDialogService.ConfirmYesNo(`Are you want to Export Excel?`, "StockTally Box").subscribe(async (res: any) => {
      if (res.flag) {
        try {
          this.spinnerService.show();

          let excelFile = [];
          if (rfidItems && rfidItems.length > 0) {
            for (let index = 0; index < rfidItems.length; index++) {
              let element = rfidItems[index]

              var excel = await this.convertRFIDBOXToObjectExcel(RFIDCLASSExportFields, element);
              excelFile.push(excel);
            }

            if (excelFile.length > 0)
              this.utilityService.exportAsCsvFile(excelFile, "StockTallyBox_Excel");
          }
          else
            this.alertDialogService.show("Data not found to export!");

          this.spinnerService.hide();
        }
        catch (error: any) {
          console.error(error);
          this.spinnerService.hide();
          this.alertDialogService.show("Something went wrong while exporting excel, contact administrator!");
        }
      }
    })
  }

  public async convertRFIDBOXToObjectExcel(fields: Array<string>, rfidItem: RFIDClass) {

    var obj: any = {};
    for (let i = 0; i < fields.length; i++) {

      if (rfidItem) {
        if (fields[i] == "RFID")
          obj[fields[i]] = rfidItem?.rfid;
        if (fields[i] == "STONE ID")
          obj[fields[i]] = rfidItem?.stoneId;
        if (fields[i] == "WEIGHT")
          obj[fields[i]] = rfidItem?.weight;
        if (fields[i] == "STATUS")
          obj[fields[i]] = rfidItem?.status;
      }

    }
    return obj;
  }

  /* #endregion */

  public closeBoxDialog() {
    this.toggle.emit(false);
  }

}
