import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-selecionar-horario',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, ProgressSpinnerModule],
  template: `
    <p-card header="Horários disponíveis">
      @if (isLoading()) {
      <div class="flex justify-center py-4">
        <p-progressSpinner
          [style]="{ width: '50px', height: '50px' }"
        ></p-progressSpinner>
      </div>
      } @else {
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        @for (slot of getAvailableSlots(); track slot) {
        <button
          type="button"
          pButton
          [class]="
            selectedHorario === slot ? 'p-button-primary' : 'p-button-outlined'
          "
          (click)="selectTimeSlot(slot)"
          class="w-full"
        >
          {{ slot }}
        </button>
        } @empty {
        <div class="col-span-full text-gray-500 italic text-center py-4">
          Nenhum horário disponível para esta data.
        </div>
        }
      </div>
      }
    </p-card>
  `,
  styles: [
    `
      :host ::ng-deep .p-button.p-button-outlined:hover {
        @apply bg-blue-50;
      }
    `,
  ],
})
export class SelecionarHorarioComponent {
  @Input() set horarios(value: string[]) {
    this._horarios.set(value);
  }

  @Input() set carregando(value: boolean) {
    this._carregando.set(value);
  }

  @Input() selectedHorario: string | null = null;

  @Output() horarioSelecionado = new EventEmitter<string>();

  private _horarios = signal<string[]>([]);
  private _carregando = signal<boolean>(false);

  getAvailableSlots() {
    return this._horarios();
  }

  isLoading() {
    return this._carregando();
  }

  selectTimeSlot(horario: string) {
    this.selectedHorario = horario;
    this.horarioSelecionado.emit(horario);
  }
}
