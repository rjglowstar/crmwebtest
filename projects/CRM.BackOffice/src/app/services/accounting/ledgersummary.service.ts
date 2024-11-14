import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { keys } from "shared/auth";
import { LedgerSummaryReportReq, LedgerSummaryReportRes } from "../../businessobjects";
import { LedgerSummary } from "../../entities";

@Injectable({
    providedIn: 'root'
})

export class LedgerSummaryService {
    private baseUrl: string;

    constructor(private http: HttpClient) {
        this.baseUrl = keys.apiUrl + 'LedgerSummary/'
    }

    public async getLedgerSummaryByLedgerId(id: string): Promise<LedgerSummary> {
        const get$ = this.http.get(this.baseUrl + "GetbyId/" + id);

        var result = await lastValueFrom(get$) as LedgerSummary;
        return result;
    }

    public async getCurrentFYLedgerSummary(ledgerId: string, transactionType: string): Promise<number> {
        const get$ = this.http.get(this.baseUrl + "GetCurrentFYPaymentDebitbyLedgerId/" + ledgerId + "/" + transactionType);

        var result = await lastValueFrom(get$) as number;
        return result;
    }

    public async getLedgerSummaryReportSummary(criteria: LedgerSummaryReportReq): Promise<LedgerSummaryReportRes> {
        const post$ = this.http.post(this.baseUrl + "GetLedgerSummaryReportSummary", criteria);

        var result = await lastValueFrom(post$) as LedgerSummaryReportRes;
        return result;
    }

    public async getLedgerOutStandingReportSummary(criteria: LedgerSummaryReportReq): Promise<LedgerSummaryReportRes> {
        const post$ = this.http.post(this.baseUrl + "GetLedgerOutStandingReportSummary", criteria);

        var result = await lastValueFrom(post$) as LedgerSummaryReportRes;
        return result;
    }

    public async getPaginatedLedgerSummaryReportByCriteria(criteria: LedgerSummaryReportReq, skip: number, take: number): Promise<LedgerSummaryReportRes> {
        const post$ = this.http.post(this.baseUrl + "GetPaginatedLedgerSummaryReport/" + skip + "/" + take, criteria);

        var result = await lastValueFrom(post$) as LedgerSummaryReportRes
        return result;
    }

    public async getCashLedgerSummary(): Promise<LedgerSummary[]> {
        const get$ = this.http.get(this.baseUrl + "GetCashLedgerSummary");

        var result = await lastValueFrom(get$) as LedgerSummary[];
        return result;
    }

    public async getBankLedgerSummary(): Promise<LedgerSummary[]> {
        const get$ = this.http.get(this.baseUrl + "GetBankLedgerSummary");

        var result = await lastValueFrom(get$) as LedgerSummary[]
        return result;
    }

    public async insert(ledgerSummary: LedgerSummary): Promise<string> {
        const post$ = this.http.post(this.baseUrl + "Insert", ledgerSummary, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(post$) as string;
        return result;
    }

    public async update(ledgerSummary: LedgerSummary): Promise<string> {
        ledgerSummary.updatedBy = keys.loginUserIdent;
        const put$ = this.http.put(this.baseUrl + "Update", ledgerSummary, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(put$) as string;
        return result;
    }

}