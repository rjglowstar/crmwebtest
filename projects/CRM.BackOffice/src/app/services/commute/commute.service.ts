import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Broker, Customer, CustomerDNorm } from 'projects/CRM.FrontOffice/src/app/entities';
import { lastValueFrom } from 'rxjs';
import { RapPriceRequest } from 'shared/businessobjects';
import { AzureFileStore, RapPrice } from 'shared/enitites';
import { CommuteItem, DeliveryCommuteItem, HoldInventoryItems, InvUpdateItem, InvUpdateItemResponse, QcCommuteItem, TempPendingPricing, UpdateInclusionData, UpdateInventoryItem } from '../../businessobjects';
import { MediaStatus } from '../../businessobjects/common/mediastatus';
import { LabUpdateItem } from '../../businessobjects/commute/labUpdateItem';
import { MediaInput } from '../../businessobjects/commute/mediaInput';
import { InventoryItems } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class CommuteService {
  public api = environment.frontOfficeBaseUrl + "Commute/";

  constructor(private http: HttpClient) { }

  public async updateStoneHold(data: CommuteItem): Promise<boolean> {
    const put$ = this.http.put(this.api + "UpdateStoneHold", data);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateStoneMemo(data: CommuteItem): Promise<boolean> {
    const put$ = this.http.put(this.api + "UpdateStoneMemo", data);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateStoneLabReturn(data: CommuteItem): Promise<boolean> {
    const put$ = this.http.put(this.api + "UpdateStoneLabReturn", data);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateStoneStatus(data: CommuteItem): Promise<boolean> {
    const put$ = this.http.put(this.api + "UpdateStoneStatus", data);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateStoneOrganizaion(data: CommuteItem): Promise<boolean> {
    const put$ = this.http.put(this.api + "UpdateStoneOrganizaion", data);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateStoneMemoHold(data: CommuteItem): Promise<boolean> {
    const put$ = this.http.put(this.api + "UpdateStoneMemoHold", data)

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateStoneStatusHold(data: CommuteItem): Promise<boolean> {
    const put$ = this.http.put(this.api + "UpdateStoneStatusHold", data);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async insertPricingRequest(data: InventoryItems[], action: string, requestedBy: string): Promise<boolean> {
    let invData = this.mappingFrontOfficeInventory(data);

    const post$ = this.http.post(this.api + "InsertPricingRequestByInventory/" + action + "/" + requestedBy, invData);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async getRapPrice(req: RapPriceRequest): Promise<RapPrice> {
    const post$ = this.http.post(this.api + "Get", req);

    var result = await lastValueFrom(post$) as RapPrice;
    return result;
  }

  public async getCustomerDNormByIdAsync(customerId: string): Promise<CustomerDNorm> {
    const get$ = this.http.get(this.api + "GetCustomerDNormById/" + customerId);

    var result = await lastValueFrom(get$) as CustomerDNorm;
    return result;
  }

  public async updateInventoryHold(data: HoldInventoryItems[]): Promise<number> {
    const put$ = this.http.put(this.api + "UpdateHoldInInventoryItems", data);

    var result = await lastValueFrom(put$) as number;
    return result;
  }

  public async updateStoneLab(data: LabUpdateItem): Promise<string[]> {
    const put$ = this.http.put(this.api + "UpdateStoneLab", data);

    var result = await lastValueFrom(put$) as string[];
    return result;
  }

  public async getExistsStoneIds(stoneIds: string[]): Promise<string[]> {
    const post$ = this.http.post(this.api + "GetExistsStoneIds", stoneIds);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async getPendingPricingTemp(stoneIds: string[]): Promise<TempPendingPricing[]> {
    const post$ = this.http.post(this.api + "GetPendingPricingTemp", stoneIds);

    var result = await lastValueFrom(post$) as TempPendingPricing[];
    return result;
  }

  public async updateBulkInventoryItemsForPI(updateItem: InvUpdateItem): Promise<InventoryItems[]> {
    const put$ = this.http.put(this.api + "UpdateBulkInventoryItemsForPurchaseInvoice", updateItem)

    var result = await lastValueFrom(put$) as InventoryItems[];
    return result;
  }

  public async updateBulkInventoryItems(updateItem: InvUpdateItem): Promise<InventoryItems[]> {
    const put$ = this.http.put(this.api + "UpdateBulkInventoryItems", updateItem);

    var result = await lastValueFrom(put$) as InventoryItems[];
    return result;
  }
  public async updateBulkMRInventoryItems(updateItem: InvUpdateItem): Promise<InventoryItems[]> {
    const put$ = this.http.put(this.api + "UpdateBulkMRInventoryItems", updateItem)

    var result = await lastValueFrom(put$) as InventoryItems[];
    return result;
  }

  public async updateBulkMRInvSupplierAndLocation(updateItem: InvUpdateItem): Promise<InventoryItems[]> {
    const put$ = this.http.put(this.api + "UpdateMRInvSupplierAndLocation", updateItem);

    var result = await lastValueFrom(put$) as InventoryItems[];
    return result;
  }

  public async updateBulkInventoryItemsForCreditNote(stoneIds: string[]): Promise<boolean> {
    const put$ = this.http.put(this.api + "UpdateBulkInventoryItemsFroCreditNote", stoneIds);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async removeBulkInventoryItems(updateItem: InvUpdateItem, returnHoldStone: boolean = false): Promise<InvUpdateItemResponse> {
    const post$ = this.http.post(this.api + "RemoveBulkInventoryItems/" + returnHoldStone, updateItem);

    var result = await lastValueFrom(post$) as InvUpdateItemResponse;
    return result;
  }

  public async updateInvItemForMemo(updateItem: InvUpdateItem): Promise<boolean> {
    const post$ = this.http.post(this.api + "UpdateInvItemForMemo", updateItem);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async updateInvItemForMemowithLocation(stoneIds: string[], location: string): Promise<boolean> {
    const post$ = this.http.post(this.api + "UpdateInvItemForLocation/" + location, stoneIds);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async updateInvItemForPhotography(stoneIds: string[]): Promise<boolean> {
    const put$ = this.http.put(this.api + "UpdateInvItemForPhotography", stoneIds);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateInclusion(updateItem: UpdateInclusionData[]): Promise<boolean> {
    const put$ = this.http.put(this.api + "UpdateInclusion", updateItem);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateStoneRfid(data: CommuteItem): Promise<boolean> {
    const put$ = this.http.put(this.api + "UpdateStoneRfid", data);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateInventoryItem(data: UpdateInventoryItem): Promise<boolean> {
    const put$ = this.http.put(this.api + "UpdateInventory", data)

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateMediaStatus(mediaInput: MediaInput[]): Promise<Array<MediaStatus>> {
    const post$ = this.http.post(this.api + "UpdateMediaStatus", mediaInput);

    var result = await lastValueFrom(post$) as MediaStatus[];
    return result;
  }

  private mappingFrontOfficeInventory(data: InventoryItems[]): any {
    let invs: any = [];
    data.forEach(z => {
      let inv: any = {};
      inv = JSON.parse(JSON.stringify(z));

      let supplier: any = {
        id: z.stoneOrg.orgId,
        name: z.stoneOrg.orgName,
        person: z.stoneOrg.deptName,
        code: z.stoneOrg.orgCode
      };

      Object.assign(inv, { supplier });
      invs.push(inv);
    });
    return invs;
  }

  public async checkHoldStones(stoneIds: string[]): Promise<string[]> {
    const post$ = this.http.post(this.api + "CheckHoldStones", stoneIds);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async checkHoldMemoStones(stoneIds: string[]): Promise<string[]> {
    const post$ = this.http.post(this.api + "CheckHoldMemoStones", stoneIds);

    var result = await lastValueFrom(post$) as string[]
    return result;
  }

  public async checkIsStockTallyEnable(): Promise<boolean> {
    const post$ = this.http.get(this.api + "StockTallyEnable");

    var result = await lastValueFrom(post$) as boolean
    return result;
  }

  public async checkMemoStones(stoneIds: string[]): Promise<string[]> {
    const post$ = this.http.post(this.api + "CheckMemoStones", stoneIds);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async removeRFIDFromInventory(stoneIds: string[]): Promise<string[]> {
    const post$ = this.http.post(this.api + "RemoveRFIDFromInventory", stoneIds)

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async stoneDeliveredByLead(deliveryCommuteItems: Array<DeliveryCommuteItem>): Promise<boolean> {
    const post$ = this.http.post(this.api + "StoneDeliveredByLead", deliveryCommuteItems);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async getPartyDetailFO(data: CommuteItem): Promise<Customer> {
    const post$ = this.http.post(this.api + "GetPartyDetailFo", data);

    var result = await lastValueFrom(post$) as Customer;
    return result;
  }

  public async getBrokerDetailFO(data: CommuteItem): Promise<Broker> {
    const post$ = this.http.post(this.api + "GetBrokerDetailFo", data);

    var result = await lastValueFrom(post$) as Broker;
    return result;
  }

  public async getAzureFileByIdentFO(ident: string): Promise<AzureFileStore[]> {
    const get$ = this.http.get(environment.apiFrontOfficeFileUploadUrl + "fileupload/FileStoreByIdent/" + ident);

    var result = await lastValueFrom(get$) as AzureFileStore[];
    return result;
  }

  public async downloadBlobFileFO(id: string): Promise<any> {
    const url = environment.apiFrontOfficeFileUploadUrl + "fileupload/DownloadFile/" + id;
    const get$ = this.http.get(url, { responseType: 'blob' });

    var result = await lastValueFrom(get$) as any;
    return result;
  }

  public async deleteMemoRequestFO(ids: Array<string>): Promise<boolean> {
    const post$ = this.http.post(this.api + "DeleteMemoRequests", ids);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async removeLabIssueInventory(stoneIds: string[]): Promise<boolean> {
    const post$ = this.http.post(this.api + "RemoveLabIssueInventory", stoneIds)

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async deleteQcRequestFO(id: string): Promise<boolean> {
    const get$ = this.http.get(this.api + "DeleteQcRequests/" + id);

    var result = await lastValueFrom(get$) as boolean;
    return result;
  }

  public async updateInventoryForRepairing(stoneIds: string[]): Promise<boolean> {
    const put$ = this.http.put(this.api + "UpdateInventoryForRepairing", stoneIds);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateQcRequestFO(qcCommuteItem: QcCommuteItem): Promise<boolean> {
    const post$ = this.http.post(this.api + "UpdateQcRequestFO", qcCommuteItem);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async removePendigPrice(stoneIds: string[]): Promise<boolean> {
    const post$ = this.http.post(this.api + "DeletePendingPrice", stoneIds);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async removePricingRequest(stoneIds: string[]): Promise<boolean> {
    const post$ = this.http.post(this.api + "DeletePricingRequest", stoneIds);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async getAllRapPrice(): Promise<any> {
    const get$ = this.http.get(this.api + "GetAllRapPrice");

    var result = await lastValueFrom(get$) as any
    return result;
  }

}