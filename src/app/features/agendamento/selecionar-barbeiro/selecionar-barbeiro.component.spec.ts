import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { SelecionarBarbeiroComponent } from './selecionar-barbeiro.component';
import { Usuario } from '../../../shared/models/usuario.model';

describe('SelecionarBarbeiroComponent', () => {
  let component: SelecionarBarbeiroComponent;
  let fixture: ComponentFixture<SelecionarBarbeiroComponent>;

  const mockBarbeiros: Usuario[] = [
    { id: '1', nome: 'Barbeiro 1', email: 'b1@test.com', ehBarbeiro: true },
    { id: '2', nome: 'Barbeiro 2', email: 'b2@test.com', ehBarbeiro: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelecionarBarbeiroComponent, ReactiveFormsModule],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(SelecionarBarbeiroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display loading spinner when carregando is true', () => {
    component.carregando = true;
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('p-progressSpinner');
    expect(spinner).toBeTruthy();
    const barberList = fixture.nativeElement.querySelector('div.grid');
    expect(barberList).toBeFalsy();
  });

  it('should display list of barbeiros when carregando is false and barbeiros are provided', () => {
    component.barbeiros = mockBarbeiros;
    component.carregando = false;
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('p-progressSpinner');
    expect(spinner).toBeFalsy();

    const barberElements =
      fixture.nativeElement.querySelectorAll('p-radioButton');
    expect(barberElements.length).toBe(mockBarbeiros.length);
    const labels = fixture.nativeElement.querySelectorAll('label');
    expect(labels[0].textContent.trim()).toBe(mockBarbeiros[0].nome);
    expect(labels[1].textContent.trim()).toBe(mockBarbeiros[1].nome);
  });

  it('should display empty message when no barbeiros are available and not loading', () => {
    component.barbeiros = [];
    component.carregando = false;
    fixture.detectChanges();

    const emptyMessage =
      fixture.nativeElement.querySelector('div.text-gray-500');
    expect(emptyMessage).toBeTruthy();
    expect(emptyMessage.textContent.trim()).toBe(
      'Nenhum barbeiro disponível no momento.'
    );
    const barberElements =
      fixture.nativeElement.querySelectorAll('p-radioButton');
    expect(barberElements.length).toBe(0);
  });

  it('should set barbeiroControl when selectedBarbeiro input is set', () => {
    component.barbeiros = mockBarbeiros;
    fixture.detectChanges();

    component.selectedBarbeiro = mockBarbeiros[0];
    fixture.detectChanges();

    expect(component.barbeiroControl.value).toEqual(mockBarbeiros[0]);
  });

  it('should emit barbeiroSelected event when a barbeiro is selected', () => {
    spyOn(component.barbeiroSelected, 'emit');
    component.barbeiros = mockBarbeiros;
    fixture.detectChanges();

    component.barbeiroControl.setValue(mockBarbeiros[1]);
    fixture.detectChanges();

    expect(component.barbeiroSelected.emit).toHaveBeenCalledWith(
      mockBarbeiros[1]
    );
  });

  it('should not emit barbeiroSelected event when barbeiroControl is set to null after an initial selection', () => {
    component.barbeiros = mockBarbeiros;
    fixture.detectChanges();

    component.barbeiroControl.setValue(mockBarbeiros[0]);
    fixture.detectChanges();

    const emitSpy = spyOn(component.barbeiroSelected, 'emit');

    component.barbeiroControl.setValue(null);
    fixture.detectChanges();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('fetchBarbers should return the current list of barbeiros', () => {
    component.barbeiros = mockBarbeiros;
    expect(component.fetchBarbers()).toEqual(mockBarbeiros);
    component.barbeiros = [];
    expect(component.fetchBarbers()).toEqual([]);
  });

  it('isLoading should return the current loading state', () => {
    component.carregando = true;
    expect(component.isLoading()).toBeTrue();
    component.carregando = false;
    expect(component.isLoading()).toBeFalse();
  });
});
