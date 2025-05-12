import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { Usuario } from '../../../shared/models/usuario.model';

@Component({
  selector: 'app-selecionar-barbeiro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    RadioButtonModule,
    ProgressSpinnerModule,
  ],
  template: `
    <p-card header="Selecione um barbeiro" styleClass="mb-4">
      @if (isLoading()) {
      <div class="flex justify-center py-4">
        <p-progressSpinner
          [style]="{ width: '50px', height: '50px' }"
        ></p-progressSpinner>
      </div>
      } @else {
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-4">
          @for (barbeiro of fetchBarbers(); track barbeiro.id) {
          <div class="flex items-center gap-2">
            <p-radioButton
              [value]="barbeiro"
              [formControl]="barbeiroControl"
              [inputId]="'barbeiro_' + barbeiro.id"
            >
            </p-radioButton>
            <label [for]="'barbeiro_' + barbeiro.id" class="cursor-pointer">
              {{ barbeiro.nome }}
            </label>
          </div>
          } @empty {
          <div class="text-gray-500 italic col-span-2">
            Nenhum barbeiro disponível no momento.
          </div>
          }
        </div>
      </div>
      }
    </p-card>
  `,
})
export class SelecionarBarbeiroComponent {
  @Input() set barbeiros(value: Usuario[]) {
    this._barbeiros.set(value);
  }

  @Input() set carregando(value: boolean) {
    this._carregando.set(value);
  }

  @Input() set selectedBarbeiro(value: Usuario | null) {
    if (value) {
      this.barbeiroControl.setValue(value);
    }
  }

  @Output() barbeiroSelected = new EventEmitter<Usuario>();

  private _barbeiros = signal<Usuario[]>([]);
  private _carregando = signal<boolean>(false);

  barbeiroControl = new FormControl<Usuario | null>(null);

  constructor() {
    this.barbeiroControl.valueChanges.subscribe((barbeiro) => {
      if (barbeiro) {
        this.barbeiroSelected.emit(barbeiro);
      }
    });
  }

  fetchBarbers() {
    return this._barbeiros();
  }

  isLoading() {
    return this._carregando();
  }
}
