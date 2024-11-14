import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, lastValueFrom } from "rxjs";
import { keys } from "shared/auth";
import { CommonResponse } from "shared/businessobjects";
import { TransactionType } from "shared/services";
import { ExportPdfMail, RojmelSearchCriteria, RojmelTransaction, TransactionSearchCriteria, TransactionSearchResult } from "../../businessobjects";
import { EwayBillNoTransaction } from "../../businessobjects/accounting/ewaybillnotransaction";
import { Transaction } from "../../entities";

@Injectable({
    providedIn: 'root'
})

export class TransactionService {
    private baseUrl: string;

    constructor(private http: HttpClient) {
        this.baseUrl = keys.apiUrl + 'Transaction/'
    }

    public async getTransactionById(id: string): Promise<Transaction> {
        const get$ = this.http.get(this.baseUrl + "Get/" + id);

        var result = await lastValueFrom(get$) as Transaction;
        return result;
    }

    public async getTransactionByCriteria(criteria: TransactionSearchCriteria, skip: number, take: number): Promise<TransactionSearchResult> {
        const post$ = this.http.post(this.baseUrl + "GetFiltered/" + skip + "/" + take, criteria);

        var result = await lastValueFrom(post$) as TransactionSearchResult;
        return result;
    }

    public async getRojmel(criteria: RojmelSearchCriteria): Promise<RojmelTransaction[]> {
        const post$ = this.http.post(this.baseUrl + "GetRojmel", criteria);

        var result = await lastValueFrom(post$) as RojmelTransaction[];
        return result;
    }

    public async insert(transaction: Transaction): Promise<string> {
        const post$ = await this.http.post(this.baseUrl + "Insert", transaction, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(post$) as string;
        return result;
    }

    public async update(transaction: Transaction): Promise<boolean> {
        transaction.updatedBy = keys.loginUserIdent;
        const put$ = this.http.put(this.baseUrl + "Update", transaction);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    public async updateEwayBill(ewaBillNo: EwayBillNoTransaction[]): Promise<boolean> {
        const put$ = this.http.put(this.baseUrl + "UpdateEwayBill", ewaBillNo)

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    public async delete(id: string): Promise<number> {
        let userId = keys.loginUserIdent;
        const delete$ = this.http.delete(this.baseUrl + "Delete/" + id + '/' + userId);

        var result = await lastValueFrom(delete$) as number;
        return result;
    }

    public async getbyNumber(number: string, type: string = 'default'): Promise<Transaction> {
        const get$ = this.http.get(this.baseUrl + "GetbyNumber/" + number + '/' + type);

        var result = await lastValueFrom(get$) as Transaction;
        return result;
    }

    public async getTransactionbyRefNumber(number: string, type: string = TransactionType.Sales.toString()): Promise<Transaction> {
        var reqHeader = new HttpHeaders({ "Content-Type": "application/json", "Cache-Control": "no-cache" });
        let jsonData = JSON.stringify(number);

        const post$ = this.http.post(this.baseUrl + "GetTransactionbyRefNumber/" + type, jsonData, { headers: reqHeader });

        var result = await lastValueFrom(post$) as Transaction;
        return result;
    }

    public async getTransactionbyNumber(number: string, type: string = TransactionType.Sales.toString()): Promise<Transaction> {
        var reqHeader = new HttpHeaders({ "Content-Type": "application/json", "Cache-Control": "no-cache" });
        let jsonData = JSON.stringify(number);

        const post$ = this.http.post(this.baseUrl + "GetTransactionbyNumber/" + type, jsonData, { headers: reqHeader });

        var result = await lastValueFrom(post$) as Transaction;
        return result;
    }

    public async getUnPaidTransactions(ledgerId: string, type: string = TransactionType.Sales.toString()): Promise<Transaction[]> {
        const get$ = this.http.get(this.baseUrl + "GetUnPaidTransactions/" + ledgerId + "/" + type);

        var result = await lastValueFrom(get$) as Transaction[];
        return result;
    }

    public async convertToSales(transactionId: string): Promise<boolean> {
        const get$ = this.http.get(this.baseUrl + "ConvertProformaToSales/" + transactionId);

        var result = await lastValueFrom(get$) as boolean;
        return result;
    }

    public async setUnPaidTransactions(transactionIds: string[], type: string): Promise<number> {
        const put$ = this.http.put(this.baseUrl + "setUnPaidTransactions/" + type, transactionIds);

        var result = await lastValueFrom(put$) as number;
        return result;
    }

    public async getAdvancePaymentForSales(partyId: string): Promise<Transaction> {
        const get$ = this.http.get(this.baseUrl + "GetReceiptAdvanceTransaction/" + partyId);

        var result = await lastValueFrom(get$) as Transaction;
        return result;
    }

    public async getCreditNotePaymentForSales(partyId: string): Promise<Transaction> {
        const get$ = this.http.get(this.baseUrl + "GetCreditNoteTransaction/" + partyId);

        var result = await lastValueFrom(get$) as Transaction;
        return result;
    }

    public async getAdvancePaymentForPurchase(partyId: string): Promise<Transaction> {
        const get$ = this.http.get(this.baseUrl + "GetPaymentAdvanceTransaction/" + partyId);

        var result = await lastValueFrom(get$) as Transaction;
        return result;
    }

    public checkPasswordForDeleteTransaction(password: string): Observable<boolean> {
        var reqHeader = new HttpHeaders({ "Content-Type": "application/json", "Cache-Control": "no-cache" });
        let jsonData = JSON.stringify(password);

        return this.http.post<boolean>(this.baseUrl + 'CheckPasswordForDeleteTransaction', jsonData, { headers: reqHeader });
    }

    public async pdfMail(data: ExportPdfMail): Promise<CommonResponse> {
        const post$ = this.http.post(this.baseUrl + "ExportToPdfMail", data);

        var result = await lastValueFrom(post$) as CommonResponse;
        return result;
    }
}