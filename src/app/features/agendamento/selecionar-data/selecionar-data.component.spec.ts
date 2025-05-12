import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { SelecionarDataComponent } from './selecionar-data.component';

describe('SelecionarDataComponent', () => {
  let component: SelecionarDataComponent;
  let fixture: ComponentFixture<SelecionarDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelecionarDataComponent, ReactiveFormsModule],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(SelecionarDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default minDate as today and maxDate as 2 months from today', () => {
    const today = new Date();
    const expectedMaxDate = new Date();
    expectedMaxDate.setMonth(expectedMaxDate.getMonth() + 2);

    expect(component.minDate.toDateString()).toBe(today.toDateString());
    expect(component.maxDate.toDateString()).toBe(
      expectedMaxDate.toDateString()
    );
  });

  it('should update dataControl when selectedDate input is set', () => {
    const testDate = new Date(2025, 5, 15);
    component.selectedDate = testDate;
    fixture.detectChanges();
    expect(component.dataControl.value).toEqual(testDate);
  });

  it('should not update dataControl if selectedDate input is set to null', () => {
    component.dataControl.setValue(new Date());
    fixture.detectChanges();
    component.selectedDate = null;
    fixture.detectChanges();
    expect(component.dataControl.value).not.toBeNull();
  });

  it('should update minDate when minDataSelecionavel input is set', () => {
    const testMinDate = new Date(2025, 6, 1);
    component.minDataSelecionavel = testMinDate;
    fixture.detectChanges();
    expect(component.minDate).toEqual(testMinDate);
  });

  it('should update maxDate when maxDataSelecionavel input is set', () => {
    const testMaxDate = new Date(2025, 7, 31);
    component.maxDataSelecionavel = testMaxDate;
    fixture.detectChanges();
    expect(component.maxDate).toEqual(testMaxDate);
  });

  it('should emit dataSelecionada event when dataControl value changes', () => {
    spyOn(component.dataSelecionada, 'emit');
    const testDate = new Date(2025, 8, 10);

    component.dataControl.setValue(testDate);
    fixture.detectChanges();

    expect(component.dataSelecionada.emit).toHaveBeenCalledWith(testDate);
  });

  it('should not emit dataSelecionada event when dataControl value changes to null', () => {
    spyOn(component.dataSelecionada, 'emit');
    component.dataControl.setValue(new Date());
    fixture.detectChanges();
    (component.dataSelecionada.emit as jasmine.Spy).calls.reset();

    component.dataControl.setValue(null);
    fixture.detectChanges();

    expect(component.dataSelecionada.emit).not.toHaveBeenCalled();
  });

  it('should render p-datePicker with correct bindings', () => {
    const today = new Date();
    const twoMonthsFromToday = new Date();
    twoMonthsFromToday.setMonth(today.getMonth() + 2);

    component.minDataSelecionavel = today;
    component.maxDataSelecionavel = twoMonthsFromToday;
    fixture.detectChanges();

    const datePickerElement =
      fixture.nativeElement.querySelector('p-datePicker');
    expect(datePickerElement).toBeTruthy();
  });
});
