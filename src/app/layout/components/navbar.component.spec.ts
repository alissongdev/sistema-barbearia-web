import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../shared/services/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

class MockAuthService {
  private authSubject = new BehaviorSubject<boolean>(true);
  isAuthenticated$ = this.authSubject.asObservable();

  private userSubject = new BehaviorSubject<any>({
    id: '1',
    nome: 'Test User',
    ehBarbeiro: false,
  });
  currentUser$ = this.userSubject.asObservable();

  logout = jasmine.createSpy('logout');

  getCurrentUser() {
    return this.userSubject.getValue();
  }

  getUserNome() {
    const user = this.userSubject.getValue();
    return user ? user.nome : null;
  }

  setAuthenticated(value: boolean) {
    this.authSubject.next(value);
  }

  setUser(value: any) {
    this.userSubject.next(value);
  }
}

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useClass: MockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as any;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display username when authenticated', () => {
    authService.setAuthenticated(true);
    authService.setUser({ id: '1', nome: 'Alice', ehBarbeiro: false });
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Bem-vindo(a), Alice');
  });

  it('should not render navbar when not authenticated', () => {
    authService.setAuthenticated(false);
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav).toBeNull();
  });

  it('should call logout and close mobile menu on logout click', () => {
    fixture.detectChanges();
    component.mobileMenuOpen.set(true);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();

    expect(authService.logout).toHaveBeenCalled();
    expect(component.mobileMenuOpen()).toBeFalse();
  });

  it('should toggle mobile menu', () => {
    fixture.detectChanges();
    expect(component.mobileMenuOpen()).toBeFalse();

    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBeTrue();

    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBeFalse();
  });

  it('should hide "Agendar" link for barbeiro', () => {
    authService.setAuthenticated(true);
    authService.setUser({ id: '1', nome: 'Bob', ehBarbeiro: true });
    fixture.detectChanges();

    const agendarLink = fixture.debugElement
      .queryAll(By.css('a'))
      .filter(
        (de) => de.nativeElement.getAttribute('routerLink') === '/agendamento'
      );
    expect(agendarLink.length).toBe(0);
  });

  it('should show "Agendar" link for non barbeiro', () => {
    authService.setAuthenticated(true);
    authService.setUser({ id: '1', nome: 'Carol', ehBarbeiro: false });
    fixture.detectChanges();

    const linkDe = fixture.debugElement.query(
      By.css('a[routerLink="/agendamento"]')
    );
    expect(linkDe).toBeTruthy();
  });
});
