import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { v4 as uuidv4 } from 'uuid';
import * as squareConnect from 'square-connect';
import { BehaviorSubject, Observable, throwError } from 'rxjs';

declare var SqPaymentForm: any;

function processPayment(paymentDetails): any {
  console.log(paymentDetails);
  // Charge the customer's card
  const payments_api = new squareConnect.PaymentsApi();
  const request_body = {
    nonce: paymentDetails.nonce,
    // location_id: paymentDetails.location_id,
    // amount_money: {
    //   amount: 100, // $1.00 charge
    //   currency: 'USD',
    // },
    idempotency_key: paymentDetails.idempotency_key,
    location_id: paymentDetails.location_id,
  };
  return fetch('http://localhost:3000/process-payment', {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nonce: paymentDetails.nonce,
      idempotency_key: paymentDetails.idempotency_key,
      location_id: paymentDetails.location_id,
    }),
  }).catch((err) => {
    alert('Network error: ' + err);
  });
}

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css'],
})
export class TicketsComponent implements OnInit {
  paymentForm: any;
  constructor() {}

  ngOnInit(): void {
    this.paymentForm = new SqPaymentForm({
      applicationId: environment.SANDBOX_APP_ID,
      locationId: environment.SANDBOX_LOCATION,
      inputClass: 'sq-input',
      autoBuild: false,
      inputStyles: [
        {
          fontSize: '16px',
          lineHeight: '24px',
          padding: '16px',
          placeholderColor: '#a0a0a0',
          backgroundColor: 'transparent',
        },
      ],
      cardNumber: {
        elementId: 'sq-card-number',
        placeholder: 'Card Number',
      },
      cvv: {
        elementId: 'sq-cvv',
        placeholder: 'CVV',
      },
      expirationDate: {
        elementId: 'sq-expiration-date',
        placeholder: 'MM/YY',
      },
      postalCode: {
        elementId: 'sq-postal-code',
        placeholder: 'Postal',
      },
      callbacks: {
        cardNonceResponseReceived: function (errors, nonce, cardData) {
          if (errors) {
            console.error('Encountered errors:');
            errors.forEach(function (error) {
              console.error('  ' + error.message);
            });
            alert(
              'Encountered errors, check browser developer console for more details'
            );
            return;
          }
          // alert(`The generated nonce is:\n${nonce}`);
          const idempotency_key = uuidv4();
          const body = {
            nonce: nonce,
            idempotency_key: idempotency_key,
            location_id: environment.SANDBOX_LOCATION,
          };
          processPayment(body).then((result) => console.log(result));
        },
      },
    });
    if (!SqPaymentForm.isSupportedBrowser()) {
      console.error('Browser not supported');
    }
    this.paymentForm.build();
  }

  // onGetCardNonce is triggered when the "Pay $1.00" button is clicked
  onGetCardNonce(event) {
    // Don't submit the form until SqPaymentForm returns with a nonce
    event.preventDefault();
    // Request a nonce from the SqPaymentForm object
    this.paymentForm.requestCardNonce();
  }
}
