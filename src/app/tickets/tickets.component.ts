import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { v4 as uuidv4 } from 'uuid';
import { MatSelectChange } from '@angular/material/select';

declare var SqPaymentForm: any;

function processPayment(paymentDetails): any {
  return fetch('http://localhost:3000/process-payment', {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nonce: paymentDetails.nonce,
      idempotency_key: paymentDetails.idempotency_key,
      location_id: paymentDetails.location_id,
      amount: paymentDetails.amount,
      email: paymentDetails.email,
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
  numbers: any = [];
  paymentForm: any;
  ticketAmount: number = 1;
  email: string = '';
  constructor() {
    for (let i = 0; i < 10; i++) {
      this.numbers[i] = i + 1;
    }
  }

  ngOnInit(): void {
    this.paymentForm = new SqPaymentForm({
      applicationId: environment.PRODUCTION_APP_ID,
      locationId: environment.PRODUCTION_LOCATION,
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
        cardNonceResponseReceived: (errors, nonce, cardData) => {
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
          const idempotency_key = uuidv4();
          let ticketAmount = this.getTicketAmount();
          let email = this.getEmail();
          const body = {
            nonce: nonce,
            idempotency_key: idempotency_key,
            location_id: environment.SANDBOX_LOCATION,
            amount: ticketAmount,
            email: email,
          };
          processPayment(body)
            .then((result) =>
              alert(
                `Thank you for your purchase. Your ticket(s) will be emailed to \n${this.getEmail()}.`
              )
            )
            .catch((error) => {
              alert(
                `Sorry, we were unable to process your purchase. Please try again later.`
              );
            });
        },
      },
    });
    if (!SqPaymentForm.isSupportedBrowser()) {
      console.error('Browser not supported');
    }
    this.paymentForm.build();
  }

  onGetCardNonce(event) {
    event.preventDefault();
    this.paymentForm.requestCardNonce();
  }

  setTicketAmount(event: MatSelectChange) {
    const selectedData = {
      value: event.value,
      text: event.source.triggerValue,
    };
    this.ticketAmount = selectedData.value;
  }

  getTicketAmount() {
    return this.ticketAmount;
  }

  setEmail(event) {
    this.email = event.target.value;
  }

  getEmail() {
    return this.email;
  }
}
