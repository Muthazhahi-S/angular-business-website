import { Component } from '@angular/core';

@Component({
  selector: 'app-testimonials',
  imports: [],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
})
export class Testimonials {
  protected readonly stories = [
    { quote: 'Northstar helped us stop chasing every opportunity and focus on the one that really mattered. We grew revenue by 34% in the first year.', name: 'Olivia Chen', role: 'CEO, Fieldwork Foods', initials: 'OC', tone: 'sage' },
    { quote: 'It felt like adding brilliant people to our team, not bringing in consultants. They made the complex feel clear—and gave us a plan we could actually use.', name: 'Marcus Reed', role: 'Founder, Common Ground', initials: 'MR', tone: 'sand' },
    { quote: 'They listened first, challenged us in all the right ways, and helped our team find a shared sense of direction. I couldn’t recommend them more.', name: 'Amara Patel', role: 'Managing Director, Openhouse', initials: 'AP', tone: 'rose' },
  ];
}
