import { Component } from '@angular/core';

@Component({
  selector: 'app-services',
  imports: [],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services {
  protected readonly services = [
    { number: '01', symbol: '⌁', name: 'Business strategy', description: 'A clearer point of view, a sharper plan, and the confidence to make your next move.' },
    { number: '02', symbol: '↗', name: 'Growth & go-to-market', description: 'Find the right customers, bring them a better offer, and grow without guesswork.' },
    { number: '03', symbol: '◉', name: 'Brand positioning', description: 'Build a brand people understand, remember, and choose for all the right reasons.' },
    { number: '04', symbol: '⌘', name: 'Customer experience', description: 'Make every interaction feel effortless, considered, and unmistakably yours.' },
    { number: '05', symbol: '✳', name: 'Team & culture', description: 'Get your people pulling in the same direction with roles and rituals that work.' },
    { number: '06', symbol: '▤', name: 'Digital transformation', description: 'Make technology simpler and more useful for the people who rely on it.' },
  ];
}
