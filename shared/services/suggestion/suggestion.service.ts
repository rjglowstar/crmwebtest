import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { Suggestion } from 'shared/enitites';

@Injectable({
  providedIn: 'root'
})
export class SuggestionService {


  private suggestion$ = new BehaviorSubject<boolean>(false);
  public selectedSuggestion$ = this.suggestion$.asObservable();

  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = keys.apiUrl + "Suggestion/";
  }


  public setSuggestion(data: boolean) {
    this.suggestion$.next(data);
  }

  public async getAllSuggestionLists(): Promise<Suggestion[]> {
    const get$ = this.http.get(this.baseUrl + "GetAll");

    var result = await lastValueFrom(get$) as Suggestion[];
    return result;
  }

  public async getAllSuggestionPaginated(skip: number, take: number): Promise<Suggestion[]> {
    const get$ = this.http.get(this.baseUrl + "GetPaginated/" + + skip + "/" + take);

    var result = await lastValueFrom(get$) as Suggestion[];
    return result;
  }

  public async insertSuggestion(suggestion: Suggestion): Promise<string> {
    const post$ = this.http.post(this.baseUrl + "Insert", suggestion, {
      observe: "body",
      responseType: "text"
    });

    var result=await lastValueFrom(post$) as string;
    return result;
  }

}
