import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BillRegisterRequest, CardTableDataResponse, MainTableDataResponse, tableTypes } from '../model/main.model';

@Injectable({ providedIn: 'root' })
export class CommonService {
  private selectedDateSubject = new BehaviorSubject<Date>(new Date());
  selectedDate$ = this.selectedDateSubject.asObservable();

  constructor() {}

  updateSelectedDate(date: Date): void {
    this.selectedDateSubject.next(date);
  }

  formatDate(date: Date): string {
    const dateString = date.toString();
    const parts = dateString.split(' ');

    const month = parts[1];
    const year = parts[3];

    return `${month}${year}`;
  }

  insertCardTotalRecordIntoMainTable(mainTableData: MainTableDataResponse, cardTableData: CardTableDataResponse, billDate: Date): MainTableDataResponse {
    const cardTotal = cardTableData.cardTableDataList.reduce((acc, row) => acc + row.billValue, 0);
    const cardTotalRecord = this.getCardTotalRegister(cardTotal, billDate);
    mainTableData.mainTableDataList.push(cardTotalRecord);
    return mainTableData;
  }

  private getCardTotalRegister(cardTotal: number, billDate: Date): BillRegisterRequest {
    const cardTotalRecord: BillRegisterRequest = {
      billType: 'Passivo',
      billName: 'Cartão de crédito',
      billValue: cardTotal,
      billDescription: 'Soma total das contas de cartão',
      billDate: this.formatDate(billDate),
      billTable: tableTypes.CREDIT_CARD,
      isRecurrent: false,
      paid: true
    };

    return cardTotalRecord;
  }
}
