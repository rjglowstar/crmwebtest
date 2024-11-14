import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { AccountingConfig, CurrencyConfig, EmployeeDNorm, LedgerDNorm, LedgerGroup, TaxType, TransactItemGroup } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class AccountingconfigService {

  private baseUrl: string;
  constructor(
    private http: HttpClient
  ) {
    this.baseUrl = keys.apiUrl + 'AccConfig/'
  }

  public async getAccoutConfig(): Promise<AccountingConfig> {
    const get$ = this.http.get(this.baseUrl + "Get");

    var result = await lastValueFrom(get$) as AccountingConfig;
    return result;
  }

  public async getLastInvoiceNum(): Promise<number> {
    const get$ = this.http.get(this.baseUrl + "InvoiceNumber/Get");

    var result = await lastValueFrom(get$) as number;
    return result;
  }

  public async updateLastInvoiceNum(invoiceNumber: number): Promise<boolean> {
    const put$ = this.http.put(this.baseUrl + "InvoiceNumber/Update", Number(invoiceNumber));

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getSalesLedger(): Promise<LedgerDNorm> {
    const get$ = this.http.get(this.baseUrl + "SalesLedger/Get");

    var result = await lastValueFrom(get$) as LedgerDNorm;
    return result;
  }

  public async updateSalesLedgerAsync(ledgerDNormObj: LedgerDNorm): Promise<boolean> {
    const put$ = this.http.put(this.baseUrl + "SalesLedger/Update", ledgerDNormObj);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateDefaultLedger(ledgerDNormObj: LedgerDNorm, ledgerType: string): Promise<boolean> {
    const post$ = this.http.post(this.baseUrl + "UpdateDefaultLedger/Update/" + ledgerType, ledgerDNormObj);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async getPurchaseLedger(): Promise<LedgerDNorm> {
    const get$ = this.http.get(this.baseUrl + "PurchaseLedger/Get");

    var result = await lastValueFrom(get$) as LedgerDNorm;
    return result;
  }

  public async updatePurchaseLedger(ledgerDNormObj: LedgerDNorm): Promise<boolean> {
    const put$ = this.http.put(this.baseUrl + "PurchaseLedger/Update", ledgerDNormObj);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getLedgerGroups(): Promise<LedgerGroup[]> {
    const get$ = this.http.get(this.baseUrl + "LedgerGroup/GetAll");

    var result = await lastValueFrom(get$) as LedgerGroup[];
    return result;
  }

  public async ledgerGroupInsert(ledgerGroupData: LedgerGroup): Promise<string> {
    const post$ = this.http.post(this.baseUrl + "LedgerGroup/Insert", ledgerGroupData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string
    return result;
  }

  public async updateLedgerGroupAsync(ledgerGroupData: LedgerGroup): Promise<boolean> {
    const put$ = this.http.put(this.baseUrl + "LedgerGroup/Update", ledgerGroupData);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async deleteLedgerGroup(groupId: string): Promise<boolean> {
    const delete$ = this.http.delete(this.baseUrl + "LedgerGroup/Delete/" + groupId);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async taxTypeInsert(taxTypeData: TaxType): Promise<string> {
    const post$ = this.http.post(this.baseUrl + "TaxType/Insert", taxTypeData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async updateTaxType(taxTypeData: TaxType): Promise<boolean> {
    const put$ = this.http.put(this.baseUrl + "TaxType/Update", taxTypeData);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async deleteTaxType(taxTypeId: string): Promise<boolean> {
    const delete$ = this.http.delete(this.baseUrl + "TaxType/Delete/" + taxTypeId)

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async getTaxTypesList(): Promise<TaxType[]> {
    const get$ = this.http.get(this.baseUrl + "TaxType/GetAll");

    var result = await lastValueFrom(get$) as TaxType[];
    return result;
  }

  public async currencyConfigInsert(currencyConfigData: CurrencyConfig): Promise<string> {
    const post$ = this.http.post(this.baseUrl + "CurrencyConfig/Insert", currencyConfigData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async updateCurrencyConfig(currencyConfigData: CurrencyConfig): Promise<boolean> {
    const put$ = this.http.put(this.baseUrl + "CurrencyConfig/Update", currencyConfigData);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async deleteCurrencyConfig(currencyConfigId: string): Promise<boolean> {
    const delete$ = this.http.delete(this.baseUrl + "CurrencyConfig/Delete/" + currencyConfigId);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async getCurrencyConfigsList(): Promise<CurrencyConfig[]> {
    const get$ = this.http.get(this.baseUrl + "CurrencyConfig/GetAll");

    var result = await lastValueFrom(get$) as CurrencyConfig[];
    return result;
  }

  public async insertTransactItemGroup(transactItemGroupData: TransactItemGroup): Promise<string> {
    const post$ = this.http.post(this.baseUrl + "TransactItemGroup/Insert", transactItemGroupData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async updateTransactItemGroup(transactItemGroupData: TransactItemGroup): Promise<boolean> {
    const put$ = this.http.put(this.baseUrl + "TransactItemGroup/Update", transactItemGroupData);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async deleteTransactItemGroup(groupId: string): Promise<boolean> {
    const delete$ = this.http.delete(this.baseUrl + "TransactItemGroup/Delete/" + groupId);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async getTransactItemGroups(): Promise<TransactItemGroup[]> {
    const get$ = this.http.get(this.baseUrl + "TransactItemGroup/GetAll");

    var result = await lastValueFrom(get$) as TransactItemGroup[]
    return result;
  }

  public getFromToCurrencyRate(fromCurrency: string, toCurrency: string, currencyConfigs: CurrencyConfig[]): { fromRate: number, toRate: number } {
    let rates: { fromRate: number, toRate: number } = { fromRate: 1, toRate: 1 };

    if (fromCurrency == toCurrency)
      return rates;

    let exists = currencyConfigs.find(z => z.fromCurrency == fromCurrency && z.toCurrency == toCurrency);
    if (exists != null) {
      rates.fromRate = exists.fromRate;
      rates.toRate = exists.toRate;
    }
    else {
      exists = currencyConfigs.find(z => z.fromCurrency == toCurrency && z.toCurrency == fromCurrency);
      if (exists != null) {
        rates.fromRate = exists.fromRate;
        rates.toRate = parseFloat((exists.fromRate / exists.toRate).toFixed(4));
      }
      else {
        rates.fromRate = (fromCurrency && fromCurrency.length > 0) ? 1 : 0.0;
        rates.toRate = 0;
      }
    }

    return rates;
  }

  public async updatePrefixAndNums(accConfigs: AccountingConfig): Promise<boolean> {
    accConfigs.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(this.baseUrl + "PrefixNumbers/Update", accConfigs);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getMemoProcess(): Promise<string[]> {
    const get$ = this.http.get(this.baseUrl + "MemoProcess/GetAll");

    var result = await lastValueFrom(get$) as string[];
    return result;
  }

  public async memoProcessInsert(name: string): Promise<string> {
    const get$ = this.http.get(this.baseUrl + "MemoProcess/Insert/" + name, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(get$) as string;
    return result;
  }

  public async deleteMemoProcess(name: string): Promise<boolean> {
    const delete$ = this.http.delete(this.baseUrl + "MemoProcess/Delete/" + name);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async addOrUpdateOpManagerList(employeeDNorm: Array<EmployeeDNorm>): Promise<boolean> {
    const post$ = this.http.post(this.baseUrl + "OPManagerNotify/AddOrUpdate", employeeDNorm);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async updateMarketingEmail(accConfigs: AccountingConfig): Promise<boolean> {
    accConfigs.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(this.baseUrl + "MarketingEmail/Update", accConfigs);

    var result = await lastValueFrom(put$) as boolean
    return result;
  }
}
