import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { BlobStorageRequest } from '../types/azure-storage';

@Injectable({
  providedIn: 'root'
})
export class SasGeneratorService {
  constructor(private http: HttpClient) {}

  getSasToken(): Observable<BlobStorageRequest> {
    return this.http.get<BlobStorageRequest>(
      `${environment.apiFileUploadUrl}/FileAzureUpload/GenerateSasToken`
    );
  }
}
