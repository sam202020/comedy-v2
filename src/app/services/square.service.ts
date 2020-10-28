import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { environment } from '../../environments/environment';

// const accessToken = environment.SANDBOX_TOKEN;

// // Set Square Connect credentials and environment
// const defaultClient = squareConnect.ApiClient.instance;

// // Configure OAuth2 access token for authorization: oauth2
// const oauth2 = defaultClient.authentications['oauth2'];
// oauth2.accessToken = accessToken;

// // Set 'basePath' to switch between sandbox env and production env
// // sandbox: https://connect.squareupsandbox.com
// // production: https://connect.squareup.com
// defaultClient.basePath = 'https://connect.squareupsandbox.com';

@Injectable({
  providedIn: 'root',
})
export class SquareService {
  constructor(private http: HttpClient) {}

  pay(body): Observable<any> {
    return this.http.post<any>(
      'http://localhost:3000/process-payment',
      body
    );
  }
}
