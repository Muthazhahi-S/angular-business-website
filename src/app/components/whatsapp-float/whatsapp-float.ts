import { afterNextRender, Component, OnDestroy, signal } from '@angular/core';
import { BUSINESS_PROFILE } from '../../site-profile';

@Component({
  selector: 'app-whatsapp-float',
  imports: [],
  templateUrl: './whatsapp-float.html',
  styleUrl: './whatsapp-float.scss',
})
export class WhatsappFloat implements OnDestroy {
  protected readonly business = BUSINESS_PROFILE;
  protected readonly contactVisible = signal(false);
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      const contactSection = document.getElementById('contact');
      if (!contactSection || typeof IntersectionObserver === 'undefined') {
        return;
      }

      this.observer = new IntersectionObserver((entries) => {
        this.contactVisible.set(entries.some((entry) => entry.isIntersecting));
      }, { threshold: 0.01 });
      this.observer.observe(contactSection);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
