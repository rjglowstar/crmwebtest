import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { IncMeasureGradeLookup } from 'shared/businessobjects';
import {
  CommonResponse,
  Lab,
  LabExpense,
  LabIssueResponse, LabIssueSearchCriteria, LabReceiveItem,
  LabRecheckRequest,
  LabResult, LabSearchCriteria,
  LabServiceCharge, LabServiceType,
  LabexpenseSearchCriteria, LabexpenseSearchResponse
} from '../../businessobjects';
import { GradingMaster } from '../../businessobjects/grading/gradingmaster';
import { LabIssue } from '../../businessobjects/lab/labIssue';
import { InventoryItems } from '../../entities';

@Injectable({
  providedIn: 'root'
})

export class LabService {
  private controllerUrl = 'Lab/';

  constructor(private http: HttpClient) { }

  public async labRequest(labData: Lab): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "Insert", labData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async labUpdate(labData: Lab): Promise<boolean> {
    labData.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "Update", labData);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getLabs(labCriteria: LabSearchCriteria, skip: number, take: number): Promise<Lab[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetPaginated/" + skip + "/" + take, labCriteria);

    var result = await lastValueFrom(post$) as Lab[];
    return result;
  }

  public async getAllLabs(): Promise<Lab[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetAll/");

    var result = await lastValueFrom(get$) as Lab[];
    return result;
  }

  public async deleteLab(id: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + this.controllerUrl + "Delete/" + id);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async labIssueRequest(labIssueData: LabIssue): Promise<CommonResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "InsertLabIssue", labIssueData);

    var result = await lastValueFrom(post$) as CommonResponse;
    return result;
  }

  public async getAllLabsIssue(): Promise<LabIssue[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetAllLabIssue");

    var result = await lastValueFrom(get$) as LabIssue[];
    return result;
  }

  public async getAllLabsIssueByStoneIds(stoneIds: string[]): Promise<LabIssue[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetAllLabIssueByStoneIds", stoneIds);

    var result = await lastValueFrom(post$) as LabIssue[];
    return result;
  }

  public async getLabIssueWithLabResultByStoneIds(stoneIds: string[]): Promise<LabIssue[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetLabIssueWithLabResultByStoneIds", stoneIds);

    var result = await lastValueFrom(post$) as LabIssue[];
    return result;
  }

  public async getLabIssue(labIssueCriteria: LabIssueSearchCriteria, skip: number, take: number): Promise<LabIssueResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetLabIssuePaginated/" + skip + "/" + take, labIssueCriteria);

    var result = await lastValueFrom(post$) as LabIssueResponse;
    return result;
  }

  public async UpdateLabReceive(labReceiveItem: LabReceiveItem[]): Promise<string[]> {
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "UpdateLabReceive", labReceiveItem);

    var result = await lastValueFrom(put$) as string[];
    return result;
  }

  public async UpdateRepairingInLabIssue(data: InventoryItems[]): Promise<boolean> {
    data.forEach(z => { z.updatedBy = keys.loginUserIdent; });
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "UpdateRepairingInLabIssue", data);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async GetGradingFromStoneIds(ids: string[]): Promise<GradingMaster[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetGradingFromStoneIds", ids);

    var result = await lastValueFrom(post$) as GradingMaster[];
    return result;
  }

  public async GetInvItemsFromStoneIds(ids: string[]): Promise<InventoryItems[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetInvItemsFromStoneIds", ids);

    var result = await lastValueFrom(post$) as InventoryItems[];
    return result;
  }

  public async InsertLabResult(labResult: LabResult[]): Promise<string[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "InsertLabResult", labResult);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async downloadExcel(organizationId: string, labIssue: LabIssue): Promise<any> {
    const url = environment.apiBackOfficeFileUploadUrl + "fileupload/DownloadExcelFile/" + organizationId;
    const post$ = this.http.post(url, labIssue, { responseType: 'blob' });

    var result = await lastValueFrom(post$) as any;
    return result;
  }

  public async exportGiaCsvData(organizationId: string, labIssue: LabIssue): Promise<any> {
    const url = environment.apiBackOfficeFileUploadUrl + "fileupload/DownloadGiaCsv/" + organizationId;
    const post$ = this.http.post(url, labIssue, { responseType: 'blob' });

    var result = await lastValueFrom(post$) as any;
    return result;
  }

  public async labRecheckRequest(labRecheckRequest: LabRecheckRequest): Promise<CommonResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "InsertLabRecheckRequest", labRecheckRequest);

    var result = await lastValueFrom(post$) as CommonResponse;
    return result;
  }

  public async UpdateControllerNoFromStoneIds(ids: string[]): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "UpdateControllerNoFromStoneIds", ids);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async getStoneIdsExistOrNotLabResultAsync(ids: string[]): Promise<string[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetStoneIdsExistOrNotLabResult/", ids);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async labServiceInsert(Data: LabServiceType[]): Promise<CommonResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "labServiceInsert", Data);

    var result = await lastValueFrom(post$) as CommonResponse;
    return result;
  }

  public async labServiceUpdate(Data: LabServiceType): Promise<boolean> {
    Data.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "labServiceUpdate", Data);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getAlllabService(): Promise<LabServiceType[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetAlllabService");

    var result = await lastValueFrom(get$) as LabServiceType[];
    return result;
  }

  public async deletelabService(id: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + this.controllerUrl + "DeletelabService/" + id);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async getLabExpense(Criteria: LabexpenseSearchCriteria, skip: number, take: number): Promise<LabexpenseSearchResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetPaginatedLabexpense/" + skip + "/" + take, Criteria);

    var result = await lastValueFrom(post$) as LabexpenseSearchResponse;
    return result;
  }

  public async getLabExpenseAll(Criteria: LabexpenseSearchCriteria): Promise<LabexpenseSearchResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetPaginatedLabexpense", Criteria)

    var result = await lastValueFrom(post$) as LabexpenseSearchResponse;
    return result;
  }

  public async labInvoiceExpenseInsert(Data: LabExpense[]): Promise<CommonResponse> {
    const post$=this.http.post(keys.apiUrl + this.controllerUrl + "labInvoiceExpenseInsert", Data);

    var result=await lastValueFrom(post$) as CommonResponse;
    return result;
  }

  public async GetRecheckCharge(Data: LabServiceCharge): Promise<CommonResponse> {
    const post$=this.http.post(keys.apiUrl + this.controllerUrl + "GetRecheckCharge", Data);

    var result=await lastValueFrom(post$) as CommonResponse;
    return result;
  }

  public async updateInventoryItemsData(inventory: InventoryItems[]): Promise<string[]> {
    inventory.forEach(z => { z.updatedBy = keys.loginUserIdent; });
    const put$=this.http.put(keys.apiUrl + this.controllerUrl + "LabUpdateInventoryItems", inventory);

    var result=await lastValueFrom(put$) as string[];
    return result;
  }

  public async updateInventoryGrading(data: IncMeasureGradeLookup[]): Promise<string[]> {
    data.forEach(z => { z.updatedBy = keys.loginUserIdent; });
    const put$=this.http.put(keys.apiUrl + this.controllerUrl + "UpdateInventoryGrading", data);

    var result=await lastValueFrom(put$) as string[];
    return result;
  }

}