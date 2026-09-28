import { Component } from '@angular/core';

@Component({
  selector: 'app-why-us',
  imports: [],
  templateUrl: './why-us.html',
  styleUrl: './why-us.scss',
})
export class WhyUs {
  protected readonly principles = [
    { number: '01', title: 'We get the whole picture', text: 'No off-the-shelf playbooks. We take time to understand your goals, people, and pressures first.' },
    { number: '02', title: 'Straight talk, always', text: 'Clear advice, honest conversations, and a team that tells you what you need to hear.' },
    { number: '03', title: 'Better together', text: 'We work with your people, not around them. The best ideas are the ones your team believes in.' },
    { number: '04', title: 'Progress you can see', text: 'Practical work, shared measures of success, and momentum that lasts beyond a slide deck.' },
  ];
}
