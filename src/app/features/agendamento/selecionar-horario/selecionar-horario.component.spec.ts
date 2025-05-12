import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { SelecionarHorarioComponent } from './selecionar-horario.component';

describe('SelecionarHorarioComponent', () => {
  let component: SelecionarHorarioComponent;
  let fixture: ComponentFixture<SelecionarHorarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SelecionarHorarioComponent,
        ButtonModule,
        CardModule,
        ProgressSpinnerModule,
      ],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(SelecionarHorarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display progress spinner when carregando is true', () => {
    component.carregando = true;
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('p-progressSpinner');
    expect(spinner).toBeTruthy();
  });

  it('should not display progress spinner when carregando is false', () => {
    component.carregando = false;
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('p-progressSpinner');
    expect(spinner).toBeFalsy();
  });

  it('should display horarios when provided and not carregando', () => {
    const mockHorarios = ['09:00', '10:00', '11:00'];
    component.horarios = mockHorarios;
    component.carregando = false;
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button[pButton]');
    expect(buttons.length).toBe(mockHorarios.length);
    buttons.forEach((button: HTMLElement, index: number) => {
      expect(button.textContent?.trim()).toBe(mockHorarios[index]);
    });
  });

  it('should display empty message when no horarios are provided and not carregando', () => {
    component.horarios = [];
    component.carregando = false;
    fixture.detectChanges();

    const emptyMessage = fixture.nativeElement.querySelector(
      '.col-span-full.text-gray-500'
    );
    expect(emptyMessage).toBeTruthy();
    expect(emptyMessage.textContent).toContain(
      'Nenhum horário disponível para esta data.'
    );
    const buttons = fixture.nativeElement.querySelectorAll('button[pButton]');
    expect(buttons.length).toBe(0);
  });

  it('should call selectTimeSlot and emit horarioSelecionado when a horario button is clicked', () => {
    const mockHorarios = ['09:00', '10:00'];
    component.horarios = mockHorarios;
    component.carregando = false;
    fixture.detectChanges();

    spyOn(component, 'selectTimeSlot').and.callThrough();
    spyOn(component.horarioSelecionado, 'emit');

    const firstButton = fixture.nativeElement.querySelectorAll(
      'button[pButton]'
    )[0] as HTMLElement;
    firstButton.click();
    fixture.detectChanges();

    expect(component.selectTimeSlot).toHaveBeenCalledWith(mockHorarios[0]);
    expect(component.selectedHorario).toBe(mockHorarios[0]);
    expect(component.horarioSelecionado.emit).toHaveBeenCalledWith(
      mockHorarios[0]
    );
  });

  it('should update selectedHorario input property', () => {
    const testHorario = '14:00';
    component.selectedHorario = testHorario;
    fixture.detectChanges();
    expect(component.selectedHorario).toBe(testHorario);
  });

  it('should apply "p-button-primary" class to selected horario button and "p-button-outlined" to others', () => {
    const mockHorarios = ['09:00', '10:00', '11:00'];
    component.horarios = mockHorarios;
    component.carregando = false;
    component.selectedHorario = '10:00';
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button[pButton]');
    expect(buttons[0].classList).toContain('p-button-outlined');
    expect(buttons[0].classList).not.toContain('p-button-primary');

    expect(buttons[1].classList).toContain('p-button-primary');
    expect(buttons[1].classList).not.toContain('p-button-outlined');

    expect(buttons[2].classList).toContain('p-button-outlined');
    expect(buttons[2].classList).not.toContain('p-button-primary');
  });

  it('getAvailableSlots should return the current value of _horarios signal', () => {
    const mockHorarios = ['15:00', '16:00'];
    component.horarios = mockHorarios;
    fixture.detectChanges();
    expect(component.getAvailableSlots()).toEqual(mockHorarios);
  });

  it('isLoading should return the current value of _carregando signal', () => {
    component.carregando = true;
    fixture.detectChanges();
    expect(component.isLoading()).toBeTrue();

    component.carregando = false;
    fixture.detectChanges();
    expect(component.isLoading()).toBeFalse();
  });

  it('selectTimeSlot method should update selectedHorario and emit event', () => {
    spyOn(component.horarioSelecionado, 'emit');
    const horarioToSelect = '17:00';

    component.selectTimeSlot(horarioToSelect);

    expect(component.selectedHorario).toBe(horarioToSelect);
    expect(component.horarioSelecionado.emit).toHaveBeenCalledWith(
      horarioToSelect
    );
  });
});
