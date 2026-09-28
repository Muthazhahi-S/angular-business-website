import { Component } from '@angular/core';
import { About } from './components/about/about';
import { Contact } from './components/contact/contact';
import { Footer } from './components/footer/footer';
import { Hero } from './components/hero/hero';
import { Navbar } from './components/navbar/navbar';
import { Services } from './components/services/services';
import { Testimonials } from './components/testimonials/testimonials';
import { WhyUs } from './components/why-us/why-us';

@Component({
  selector: 'app-root',
  imports: [Navbar, Hero, Services, About, WhyUs, Testimonials, Contact, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
}
