import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CommonResponse, GridDetailConfig } from 'shared/businessobjects';
import { GridConfig, GridMasterConfig } from 'shared/enitites';
import { InvDetailData, StoneProposalMailData } from '../../businessobjects';
import { Lead, Scheme, StoneProposal } from '../../entities';
import { CustomerPrefStoneConfig } from '../../entities/customer/customerprefstoneconfig';

@Injectable({
  providedIn: 'root'
})

export class StoneProposalService {
  public apiUrl = keys.apiUrl + "StoneProposal/";

  constructor(private http: HttpClient) { }

  public async getStoneProposalById(id: string): Promise<StoneProposal> {
    const get$ = this.http.get(this.apiUrl + "GetById/" + id);

    var result = await lastValueFrom(get$) as StoneProposal;
    return result;
  }

  public async getStoneProposalByToken(token: string): Promise<StoneProposal> {
    const get$ = this.http.get(this.apiUrl + "GetByToken/" + token);

    var result = await lastValueFrom(get$) as StoneProposal;
    return result;
  }

  public async getInventoriesByStoneProposalToken(token: string): Promise<InvDetailData[]> {
    const get$ = this.http.get(this.apiUrl + "GetFilterInventoriesByProposalToken/" + token);

    var result = await lastValueFrom(get$) as InvDetailData[];
    return result;
  }

  public async sendStoneProposal(data: StoneProposalMailData): Promise<CommonResponse> {
    const post$ = this.http.post(this.apiUrl + "SendStoneProposal", data);

    var result = await lastValueFrom(post$) as CommonResponse;
    return result;
  }

  public async getLeadStoneIdsByCustomerAsync(customerId: string): Promise<string[]> {
    const get$ = this.http.get(this.apiUrl + "GetLeadStoneIds/" + customerId);

    var result = await lastValueFrom(get$) as string[];
    return result;
  }

  public async getCustomerPreferenceByCustomer(id: string): Promise<CustomerPrefStoneConfig> {
    const get$ = this.http.get(this.apiUrl + "GetEmpPrefrenceById/" + id);

    var result = await lastValueFrom(get$) as CustomerPrefStoneConfig;
    return result
  }

  public async insertLeadFromProposalAsync(lead: Lead): Promise<string> {
    const post$ = this.http.post(this.apiUrl + "InsertLead", lead, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string
    return result;
  }

  public async addProposalSelectedStonesAsync(proposalId: string, selectedStoneIds: string[]): Promise<boolean> {
    const post$ = this.http.post(this.apiUrl + "AddStoneProposal/" + proposalId, selectedStoneIds);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async updateProposalSelectedStonesAsync(proposalId: string, selectedStoneIds: string[]): Promise<boolean> {
    const put$ = this.http.put(this.apiUrl + "UpdateStoneProposal/" + proposalId, selectedStoneIds);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async removeProposalSelectedStonesAsync(proposalId: string, selectedStoneIds: string[]): Promise<boolean> {
    const put$ = this.http.put(this.apiUrl + "RemoveStoneProposal/" + proposalId, selectedStoneIds);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  // New

  public async getUserIdByToken(token: string): Promise<string> {
    const get$ = this.http.get(this.apiUrl + "GetCustomerIdByToken/" + token, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(get$) as string;
    return result;
  }

  public async tokenValidator(token: string): Promise<boolean> {
    const get$ = this.http.get(this.apiUrl + "ValidateToken/" + token);

    var result = await lastValueFrom(get$) as boolean;
    return result;
  }

  public async getGridConfig(empId: string, pageName: string, gridName: string, gridDetailConfig: GridDetailConfig[] = []): Promise<GridConfig> {
    try {
      let gridConfig!: GridConfig;
      let gridConfigCollection = new Array<GridConfig>();

      let sesValue = sessionStorage.getItem("GridConfig");
      if (sesValue) {
        gridConfigCollection = JSON.parse(sesValue) as GridConfig[];
        if (gridConfigCollection && gridConfigCollection.length > 0) {
          let config = gridConfigCollection.find(c => c.empID == empId && c.pageName.toLowerCase() == pageName.toLowerCase() && c.gridName.toLowerCase() == gridName.toLowerCase());
          if (config && config.id)
            gridConfig = config;
        }
      }
      if (!gridConfig) {
        const get$ = this.http.get(this.apiUrl + "Config/GetGridConfig/" + empId + "/" + pageName + "/" + gridName);
        let config = await lastValueFrom(get$) as GridConfig;

        if (config && config.id) {

          //Check if any new column added
          if (gridDetailConfig.length > 0) {
            gridDetailConfig.forEach(item => {
              let exists = config.gridDetail.find(z => z.title == item.title);
              if (exists == null)
                config.gridDetail.push(item);
              else
                exists.propertyName = item.propertyName;
            });
          }

          gridConfigCollection.push(config);
          sessionStorage.setItem("GridConfig", JSON.stringify(gridConfigCollection));
        }
      }

      if (gridConfigCollection && gridConfigCollection.length > 0)
        gridConfig = gridConfigCollection.find(c => c.empID == empId && c.pageName.toLowerCase() == pageName.toLowerCase() && c.gridName.toLowerCase() == gridName.toLowerCase()) || gridConfig;

      return gridConfig;

    }
    catch (error) {
      throw error;
    }
  }

  public async insertGridConfig(gridConfig: GridConfig): Promise<string> {
    const post$ = this.http.post(this.apiUrl + "InsertGridConfig", gridConfig, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async updateGridConfig(gridConfig: GridConfig): Promise<boolean> {
    const put$ = this.http.put(this.apiUrl + "UpdateGridConfig", gridConfig);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getMasterGridConfig(pageName: string, gridName: string): Promise<GridMasterConfig> {
    try {
      let gridMasterConfig!: GridMasterConfig;
      if (!gridMasterConfig) {
        const get$ = this.http.get(this.apiUrl + "Config/GetMasterGridConfig/" + pageName + "/" + gridName);
        gridMasterConfig = await lastValueFrom(get$) as GridMasterConfig;
      }
      return gridMasterConfig;

    }
    catch (error) {
      throw error;
    }
  }

  public async getOnlineSchemeAsync(isOnLine: boolean): Promise<Scheme> {
    const get$ = this.http.get(this.apiUrl + "GetByType/" + isOnLine);

    var result = await lastValueFrom(get$) as Scheme;
    return result;
  }

}