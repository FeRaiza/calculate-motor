import { Component } from '@angular/core';

@Component({
  selector: 'app-colabs',
  templateUrl: './colabs.component.html',
  styleUrls: ['./colabs.component.css']
})
export class ColabsComponent {
  onLinkedinClick(event: Event) {
    event.preventDefault();
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    if (link && link instanceof HTMLAnchorElement && link.href) {
      window.open(link.href, '_blank', 'noopener');
    }
  }
}
