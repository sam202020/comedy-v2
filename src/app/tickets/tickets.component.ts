import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { v4 as uuidv4 } from 'uuid';
import { MatSelectChange } from '@angular/material/select';
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Pipe({
  name: 'range',
})
export class RangePipe implements PipeTransform {
  transform(length: number, offset: number = 0): number[] {
    if (!length) {
      return [];
    }
    const array = [];
    for (let n = 0; n < length; ++n) {
      array.push(offset + n);
    }
    return array;
  }
}

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
      amount: paymentDetails.amount,
      email: paymentDetails.email,
      date: paymentDetails.date,
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
  date: any;
  dates: any = [];
  paid: boolean = false;
  document: any;
  numbers: any = [];
  paymentForm: any;
  ticketAmount: number = 1;
  selectedDate: any;
  email: string = '';
  constructor(@Inject(DOCUMENT) document, private route: ActivatedRoute) {
    this.document = document;
    for (let i = 0; i < 10; i++) {
      this.numbers[i] = i + 1;
    }
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.date = params['date'];
      this.selectedDate = params['date'];
      this.dates[0] = 'Friday ' + this.date;
      let dateWithoutDash = this.date.replace(/-/g, '');
      let dateNum = parseInt(dateWithoutDash, 10);
      let nextDay = dateNum + 1;
      let nextDayStr = nextDay.toString();
      let nextDate = nextDayStr.substring(0, 1) + '-' + nextDayStr.substring(1);
      this.dates[1] = 'Saturday ' + nextDate;
    });
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
              'Please check your credit card details, it does not appear to be valid.'
            );
            return;
          }
          const idempotency_key = uuidv4();
          let ticketAmount = this.getTicketAmount();
          let email = this.getEmail();
          let date = this.getDate();
          const body = {
            nonce: nonce,
            idempotency_key: idempotency_key,
            location_id: environment.PRODUCTION_LOCATION,
            amount: ticketAmount,
            email: email,
            date: date,
          };
          processPayment(body)
            .then((result) => {
              this.setPaid(true);
            })
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

  setPayButtonDisableState(newState) {
    var payButton = this.document.getElementById('sq-creditcard');
    payButton.disabled = newState;
    //Redraw the payment button
    var buttonContent = payButton.innerHTML;
    payButton.innerHTML = buttonContent;
  }

  onGetCardNonce(event) {
    this.setPayButtonDisableState(true);
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

  setDate(event: MatSelectChange) {
    const selectedData = {
      value: event.value,
      text: event.source.triggerValue,
    };
    this.selectedDate = selectedData.value;
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

  setPaid(paid: boolean) {
    this.paid = paid;
  }

  getPaid() {
    return this.paid;
  }

  getDate() {
    return this.selectedDate;
  }
}
