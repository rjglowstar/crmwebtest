import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth/keys';
import { LedgerSearchCriteria, LedgerSummaryAnalysis } from '../../businessobjects';
import { LedgerSummaryCriteria } from '../../businessobjects/accounting/ledgersummarycriteria';
import { BankDNorm, Ledger, LedgerDNorm } from '../../entities';

@Injectable({
  providedIn: 'root'
})

export class LedgerService {

  constructor(private http: HttpClient) { }

  public async getLedgerById(id: string): Promise<Ledger> {
    const get$ = this.http.get(keys.apiUrl + "Ledger/Get/" + id);

    var result = await lastValueFrom(get$) as Ledger;
    return result;
  }

  public async getLedgerByCustomerIdent(ident: string): Promise<Ledger> {
    const get$ = this.http.get(keys.apiUrl + "Ledger/GetLedgerByCustomerIdent/" + ident);

    var result = await lastValueFrom(get$) as Ledger;
    return result;
  }

  public async getLedgerDNormByIdent(ident: string): Promise<LedgerDNorm> {
    const get$ = this.http.get(keys.apiUrl + "Ledger/GetLedgerDNormbyIdent/" + ident);

    var result = await lastValueFrom(get$) as LedgerDNorm;
    return result;
  }

  public async getLedgerDNormByName(name: string): Promise<LedgerDNorm[]> {
    const get$ = this.http.get(keys.apiUrl + "Ledger/GetDNormByName/" + name);

    var result = await lastValueFrom(get$) as LedgerDNorm[];
    return result;
  }

  public async getLedgerDNormByGroup(group: string): Promise<LedgerDNorm[]> {
    const get$ = this.http.get(keys.apiUrl + "Ledger/GetDNormByGroup/" + group);

    var result = await lastValueFrom(get$) as LedgerDNorm[];
    return result;
  }

  public async getAllLedgers(): Promise<Ledger[]> {
    const get$ = this.http.get(keys.apiUrl + "Ledger/GetAll");

    var result = await lastValueFrom(get$) as Ledger[];
    return result;
  }

  public async getLedgersByCriteria(ledgerSearchCriteria: LedgerSearchCriteria, skip: number, take: number): Promise<Ledger[]> {
    const post$ = this.http.post(keys.apiUrl + "Ledger/GetbyCriteria/" + skip + "/" + take, ledgerSearchCriteria);

    var result = await lastValueFrom(post$) as Ledger[];
    return result;
  }

  public async getPaginatedLedgers(skip: number, take: number): Promise<Ledger[]> {
    const get$ = this.http.get(keys.apiUrl + "Ledger/GetPaginated/" + skip + "/" + take);

    var result = await lastValueFrom(get$) as Ledger[];
    return result;
  }

  public async checkLedgerExist(searchCriteria: LedgerSearchCriteria): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + "Ledger/CheckLedgerExist", searchCriteria);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }


  public async getLedgerIsVerifiedIsCertReminder(id: string): Promise<LedgerDNorm> {
    const get$ = this.http.get(keys.apiUrl + "Ledger/LedgerIsVerifiedIsCertReminder/" + id);

    var result = await lastValueFrom(get$) as LedgerDNorm;
    return result;
  }

  public async getLedgerAddDeclaration(id: string): Promise<string> {
    const get$ = await this.http.get(keys.apiUrl + "Ledger/GetLedgerAddDeclaration/" + id, {
      observe: "body",
      responseType: "text"
    });
    var result = await lastValueFrom(get$) as string;
    return result;
  }

  public async ledgerRequest(ledgerData: Ledger): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + "Ledger/Insert", ledgerData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async ledgerUpdate(ledgerData: Ledger): Promise<boolean> {
    ledgerData.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + "Ledger/Update", ledgerData);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async deleteLedger(ledgerId: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + "Ledger/Delete/" + ledgerId);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async deleteLedgerIdent(customerId: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + "Ledger/DeleteIdent/" + customerId);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async getBankAccounts(): Promise<BankDNorm[]> {
    const get$ = this.http.get(keys.apiUrl + "Ledger/GetBankAccounts");

    var result = await lastValueFrom(get$) as BankDNorm[];
    return result;
  }

  public async getAllLedgersByType(types: string[], value: string = " "): Promise<Ledger[]> {
    const post$ = this.http.post(keys.apiUrl + "Ledger/GetAllLegderByType/" + value, types);

    var result = await lastValueFrom(post$) as Ledger[];
    return result;
  }

  public async getAllLedgersByNature(nature: string, value: string = " "): Promise<Ledger[]> {
    const get$ = this.http.get(keys.apiUrl + "Ledger/GetAllLegderByNature/" + nature + "/" + value);

    var result = await lastValueFrom(get$) as Ledger[];
    return result;
  }

  public async getLedgerSummaryAnalysis(ledgerSummaryCriteria: LedgerSummaryCriteria, skip: number, take: number): Promise<LedgerSummaryAnalysis> {
    const post$ = this.http.post(keys.apiUrl + "Ledger/GetLedgerSummaryAnalysis/" + skip + "/" + take, ledgerSummaryCriteria);

    var result = await lastValueFrom(post$) as LedgerSummaryAnalysis;
    return result;
  }
}