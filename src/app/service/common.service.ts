import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BillRegisterRequest, TableDataResponse, tableTypes } from '../model/main.model';

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
}
