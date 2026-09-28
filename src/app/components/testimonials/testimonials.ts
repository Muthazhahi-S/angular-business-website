import { Component } from '@angular/core';

@Component({
  selector: 'app-testimonials',
  imports: [],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
})
export class Testimonials {
  protected readonly outcomes = [
    { number: '01', title: 'A clearer direction', description: 'A shared understanding of what matters now, what can wait, and where to focus next.' },
    { number: '02', title: 'A plan people own', description: 'Practical next steps shaped with your team, grounded in the way your business works.' },
    { number: '03', title: 'Progress that lasts', description: 'Better decisions and useful momentum that carry on long after the initial engagement.' },
  ];
}
