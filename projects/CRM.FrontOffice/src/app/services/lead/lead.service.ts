import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { LeadDetailResponse, LeadDetailSearchCriteria, LeadInvExport, LeadRejectedStoneResponse, LeadRejectedStoneSearchCriteria, LeadResponse, LeadSearchCriteria, OrderDetailResponse, OrderResponse, OrderSearchCriteria } from '../../businessobjects';
import { SellerLeadAnalysis } from '../../businessobjects/analysis/sellerleadanalysis';
import { LeadDetailSummary } from '../../businessobjects/business/leaddetailsummary';
import { InvItem, Lead, LeadRejectedOffer, LeadRejectedOfferItem, LeadStoneReleaseItem, LeadStoneReleaseRequest, SystemUserDNorm } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private controllerUrl = 'Lead/';

  constructor(private http: HttpClient) { }

  public async getAllLeads(leadSearchCriteria: LeadSearchCriteria): Promise<LeadResponse[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetAll", leadSearchCriteria);

    var result = await lastValueFrom(post$) as LeadResponse[];
    return result;
  }

  public async getAllFilteredLeads(leadSearchCriteria: LeadSearchCriteria): Promise<OrderDetailResponse[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetFiltered", leadSearchCriteria);

    var result = await lastValueFrom(post$) as OrderDetailResponse[];
    return result;
  }

  public async getLeadsBySellerWise(leadSearchCriteria: LeadSearchCriteria): Promise<SellerLeadAnalysis[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "LeadsBySellerWise", leadSearchCriteria);

    var result = await lastValueFrom(post$) as SellerLeadAnalysis[];
    return result;
  }

  public async getLeadById(id: string): Promise<Lead> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "Get/" + id);

    var result = await lastValueFrom(get$) as Lead;
    return result;
  }

  public async getOneDayAgoRejectedStone(invIds: string[], id: string): Promise<string[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "OneDayAgoRejected/" + id, invIds);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async getLeadByNo(no: string): Promise<Lead> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetByNo/" + no);

    var result = await lastValueFrom(get$) as Lead;
    return result;
  }

  public async getProcessDateByLeadNo(leadNo: number): Promise<boolean> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetProcessDateByLeadNo/" + leadNo);

    var result = await lastValueFrom(get$) as boolean;
    return result;
  }

  public async getLeadRejecetdByOfferId(id: string): Promise<LeadRejectedOffer> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetRejectedLead/" + id);

    var result = await lastValueFrom(get$) as LeadRejectedOffer;
    return result;
  }

  public async getLeadRejecetdInvItemsByOfferId(id: string): Promise<Array<LeadRejectedOfferItem>> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetRejectedLeadInvItems/" + id);

    var result = await lastValueFrom(get$) as Array<LeadRejectedOfferItem>;
    return result;
  }

  public async getStonesByLeadId(leadId: string, isRejected?: boolean): Promise<InvItem[]> {
    const actualIsRejected = isRejected !== undefined ? isRejected : "";
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetStonesByLeadId/" + leadId + "/" + actualIsRejected);

    var result = await lastValueFrom(get$) as InvItem[];
    return result;
  }

  public async getLeads(status: string): Promise<Lead[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetByStatus/" + status);

    var result = await lastValueFrom(get$) as Lead[];
    return result;
  }

  public async getLeadDetailSummary(leadDetailSearchCriteria: LeadDetailSearchCriteria): Promise<LeadDetailSummary> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetLeadDetailSummary", leadDetailSearchCriteria);

    var result = await lastValueFrom(post$) as LeadDetailSummary;
    return result;
  }

  public async leadInsert(leadData: Lead): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "Insert", leadData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async leadRejectedOfferInsert(leadRejectedOfferData: LeadRejectedOffer): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "InsertRejectedOffer", leadRejectedOfferData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async getRejectedLeadPaginated(rejectedStoneSearchCriteria: LeadRejectedStoneSearchCriteria, skip: number, take: number): Promise<LeadRejectedStoneResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetRejectedLeadPaginated/" + skip + "/" + take, rejectedStoneSearchCriteria);

    var result = await lastValueFrom(post$) as LeadRejectedStoneResponse;
    return result;
  }

  public async updateLeadTimeoutExpired(leadId: string): Promise<boolean> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "UpdateLeadTimeoutExpired/" + leadId);

    var result = await lastValueFrom(get$) as boolean;
    return result;
  }

  public async updateProcessDate(leadId: string): Promise<boolean> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "UpdateLeadProcessDate/" + leadId);

    var result = await lastValueFrom(get$) as boolean;
    return result;
  }

  public async resetProcessedOrder(leadId: string, stoneIds: Array<string>): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "ResetLeadProcess/" + leadId, stoneIds);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async updateLeadInventory(leadId: string, leadInvItems: InvItem[]): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "UpdateLeadInventory/" + leadId, leadInvItems);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async leadUpdate(leadData: Lead): Promise<boolean> {
    leadData.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "Update", leadData);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getSellerDNormById(id: string): Promise<SystemUserDNorm> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetSellerDNormById/" + id);

    var result = await lastValueFrom(get$) as SystemUserDNorm;
    return result;
  }

  public async getLastPurchaseAmountForVow(customerId: string): Promise<number> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetLastPurchaseAmountForVow/" + customerId);

    var result = await lastValueFrom(get$) as number;
    return result;
  }

  public async getOrderFromLeadPaginated(orderSearchCriteria: OrderSearchCriteria, skip: number, take: number): Promise<OrderResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetOrdersFromLeadPaginated/" + skip + "/" + take, orderSearchCriteria);

    var result = await lastValueFrom(post$) as OrderResponse;
    return result;
  }

  public async getHoldLeadStoneByStoneIds(stoneIds: string[], sellerId: string): Promise<LeadStoneReleaseItem[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetHoldLeadStoneByStoneIds/" + sellerId, stoneIds);

    var result = await lastValueFrom(post$) as LeadStoneReleaseItem[];
    return result;
  }

  public async getLeadReleaseStoneById(id: string): Promise<LeadStoneReleaseRequest> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetLeadReleaseStoneRequest/" + id);

    var result = await lastValueFrom(get$) as LeadStoneReleaseRequest;
    return result;
  }

  public async leadLeadReleaseStoneInsert(leadStoneReleaseRequest: LeadStoneReleaseRequest): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "InsertLeadReleaseStone", leadStoneReleaseRequest, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async leadLeadReleaseStoneUpdate(leadStoneReleaseRequest: LeadStoneReleaseRequest, isAccepted: boolean = true): Promise<boolean> {
    leadStoneReleaseRequest.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "UpdateLeadReleaseStoneRequest/" + isAccepted, leadStoneReleaseRequest);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async leadLeadRejectStoneByLeadNo(leadStoneReleaseItems: LeadStoneReleaseItem[]): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "UpdateLeadStoneRejectByLeadNo/", leadStoneReleaseItems);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async updateSalesCancelStones(stoneIds: string[]): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "UpdateInventoryStoneForSalesCancel", stoneIds);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getLeadsDetailPaginated(leadDetailSearchCriteria: LeadDetailSearchCriteria, skip: number, take: number): Promise<LeadDetailResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetLeadsDetailPaginated/" + skip + "/" + take, leadDetailSearchCriteria);

    var result = await lastValueFrom(post$) as LeadDetailResponse;
    return result;
  }

  public async downloadLeadInvItemsExcel(leadInvExport: LeadInvExport): Promise<any> {
    const url = keys.apiUrl + this.controllerUrl + "DownloadLeadInvItemsExcel";
    const post$ = this.http.post(url, leadInvExport, { responseType: 'blob' });

    var result = await lastValueFrom(post$) as any;
    return result;
  }

  public async deleteLeadRejectedOffer(Id: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + this.controllerUrl + "DeleteLeadRejectOffer/" + Id);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async aiGeneratedLead( sellerId: string,customerId: string[]): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "AIGenerateLead/" + sellerId, customerId);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

}