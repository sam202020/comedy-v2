import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import * as squareConnect from 'square-connect';
import { environment } from '../../environments/environment';

const accessToken = environment.SANDBOX_TOKEN;

// Set Square Connect credentials and environment
const defaultClient = squareConnect.ApiClient.instance;

// Configure OAuth2 access token for authorization: oauth2
const oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = accessToken;

// Set 'basePath' to switch between sandbox env and production env
// sandbox: https://connect.squareupsandbox.com
// production: https://connect.squareup.com
defaultClient.basePath = 'https://connect.squareupsandbox.com';

@Injectable({
  providedIn: 'root',
})
export class SquareService {
  constructor() {}

  async processPayment(paymentDetails): Promise<any> {
    // Charge the customer's card
    const payments_api = new squareConnect.PaymentsApi();
    const request_body = {
      source_id: paymentDetails.nonce,
      amount_money: {
        amount: 100, // $1.00 charge
        currency: 'USD',
      },
      idempotency_key: paymentDetails.idempotency_key,
    };
    try {
      const response = await payments_api.createPayment(request_body);
      return response;
    } catch (error) {
      return error.response.text;
    }
  }
}
