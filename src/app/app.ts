import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { About } from './components/about/about';
import { Contact } from './components/contact/contact';
import { Footer } from './components/footer/footer';
import { Hero } from './components/hero/hero';
import { Navbar } from './components/navbar/navbar';
import { Packages } from './components/packages/packages';
import { Services } from './components/services/services';
import { Testimonials } from './components/testimonials/testimonials';
import { WhyUs } from './components/why-us/why-us';
import { WhatsappFloat } from './components/whatsapp-float/whatsapp-float';
import { BUSINESS_PROFILE } from './site-profile';

@Component({
  selector: 'app-root',
  imports: [Navbar, Hero, Services, Packages, About, WhyUs, Testimonials, Contact, Footer, WhatsappFloat],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor(title: Title, meta: Meta) {
    title.setTitle(BUSINESS_PROFILE.pageTitle);
    meta.updateTag({
      name: 'description',
      content: BUSINESS_PROFILE.pageDescription,
    });
  }
}
