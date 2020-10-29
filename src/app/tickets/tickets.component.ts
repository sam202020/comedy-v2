import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { v4 as uuidv4 } from 'uuid';
import { MatSelectChange } from '@angular/material/select';

declare var SqPaymentForm: any;

function processPayment(paymentDetails): any {
  return fetch('https://pacific-earth-80477.herokuapp.com/process-payment', {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
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
  numbers: any = [];
  paymentForm: any;
  ticketAmount: number = 1;
  constructor() {
    for (let i = 0; i < 10; i++) {
      this.numbers[i] = i + 1;
    }
  }

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
          // alert(`The generated nonce is:\n${nonce}`);
          const idempotency_key = uuidv4();
          let ticketAmount = this.getTicketAmount();
          const body = {
            nonce: nonce,
            idempotency_key: idempotency_key,
            location_id: environment.SANDBOX_LOCATION,
            amount: ticketAmount
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
}
