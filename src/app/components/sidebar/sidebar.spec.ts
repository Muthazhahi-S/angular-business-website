import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('activePage', 'Dashboard');
    fixture.detectChanges();
  });

  it('keeps workspace and account names separate from decorative initials', () => {
    const element = fixture.nativeElement as HTMLElement;
    const workspaceAvatar = element.querySelector<HTMLElement>('.workspace-switcher__avatar');
    const workspaceName = element.querySelector<HTMLElement>('.workspace-switcher__name');
    const workspaceChevron = element.querySelector<HTMLElement>('.workspace-switcher__chevron');
    const accountAvatar = element.querySelector<HTMLElement>('.account__avatar');
    const accountName = element.querySelector<HTMLElement>('.account__name');

    expect(workspaceAvatar?.textContent?.trim()).toBe('U');
    expect(workspaceAvatar?.getAttribute('aria-hidden')).toBe('true');
    expect(workspaceName?.textContent?.trim()).toBe('UrbanNest Interiors');
    expect(element.textContent?.match(/UrbanNest Interiors/g)).toHaveLength(1);
    expect(workspaceChevron?.getAttribute('aria-hidden')).toBe('true');
    expect(workspaceChevron?.querySelector('svg')).not.toBeNull();
    expect(workspaceChevron?.textContent?.trim()).toBe('');
    expect(accountAvatar?.textContent?.trim()).toBe('AS');
    expect(accountAvatar?.getAttribute('aria-hidden')).toBe('true');
    expect(accountName?.textContent?.trim()).toBe('Ananya Sharma');
    expect(element.textContent?.match(/Ananya Sharma/g)).toHaveLength(1);
  });

  it('opens the business selector with the current business and Business Profile option', () => {
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.workspace-switcher')!.click();
    fixture.detectChanges();

    expect(element.querySelector('.workspace-switcher')?.getAttribute('aria-expanded')).toBe('true');
    expect(element.querySelector('[role="menu"]')?.textContent).toContain('UrbanNest Interiors');
    expect(element.querySelector('[role="menuitemradio"]')?.getAttribute('aria-checked')).toBe('true');
    expect(element.querySelector('[role="menuitem"]')?.textContent).toContain('Business Profile');
    expect(element.querySelector('.workspace-switcher__chevron')?.classList)
      .toContain('workspace-switcher__chevron--open');
  });

  it('navigates to Business Profile and closes the selector', () => {
    const navigate = vi.fn();
    fixture.componentInstance.navigate.subscribe(navigate);
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.workspace-switcher')!.click();
    fixture.detectChanges();
    element.querySelector<HTMLButtonElement>('.workspace-menu__item:not(.workspace-menu__item--current)')!
      .click();
    fixture.detectChanges();

    expect(navigate).toHaveBeenCalledWith('Business Profile');
    expect(element.querySelector('[role="menu"]')).toBeNull();
  });

  it('navigates to Dashboard when the current business is selected', () => {
    const navigate = vi.fn();
    fixture.componentInstance.navigate.subscribe(navigate);
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.workspace-switcher')!.click();
    fixture.detectChanges();
    element.querySelector<HTMLButtonElement>('.workspace-menu__item--current')!.click();
    fixture.detectChanges();

    expect(navigate).toHaveBeenCalledWith('Dashboard');
    expect(element.querySelector('[role="menu"]')).toBeNull();
  });

  it('closes the business selector on outside click', () => {
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.workspace-switcher')!.click();
    fixture.detectChanges();

    document.body.click();
    fixture.detectChanges();

    expect(element.querySelector('[role="menu"]')).toBeNull();
  });

  it('closes the business selector on Escape', () => {
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.workspace-switcher')!.click();
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(element.querySelector('[role="menu"]')).toBeNull();
  });
});
