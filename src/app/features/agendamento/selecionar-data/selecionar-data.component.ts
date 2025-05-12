import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-selecionar-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, DatePickerModule],
  template: `
    <p-card header="Selecione uma data">
      <p-datePicker
        [formControl]="dataControl"
        [inline]="true"
        [showButtonBar]="false"
        [minDate]="minDate"
        [maxDate]="maxDate"
        styleClass="w-full"
      >
      </p-datePicker>
    </p-card>
  `,
  styles: [
    `
      :host ::ng-deep .p-datepicker {
        width: 100%;
      }

      :host ::ng-deep .p-datepicker table {
        width: 100%;
      }
    `,
  ],
})
export class SelecionarDataComponent {
  @Input() set selectedDate(value: Date | null) {
    if (value) {
      this.dataControl.setValue(value);
    }
  }

  @Input() set minDataSelecionavel(value: Date) {
    this._minDate.set(value);
  }

  @Input() set maxDataSelecionavel(value: Date) {
    this._maxDate.set(value);
  }

  @Output() dataSelecionada = new EventEmitter<Date>();

  private _minDate = signal<Date>(new Date());
  private _maxDate = signal<Date>(this.getMaxDate());

  dataControl = new FormControl<Date | null>(null);

  constructor() {
    this.dataControl.valueChanges.subscribe((data) => {
      if (data) {
        this.dataSelecionada.emit(data);
      }
    });
  }

  private getMaxDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + 2);
    return date;
  }

  get minDate(): Date {
    return this._minDate();
  }

  get maxDate(): Date {
    return this._maxDate();
  }
}
