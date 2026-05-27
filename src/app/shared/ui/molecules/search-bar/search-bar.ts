import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button';
import { IconComponent } from '../../atoms/icon/icon';

@Component({
  selector: 'app-search-bar',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBarComponent implements OnChanges {
  @Input() placeholder = 'Buscar';
  @Input() value = '';
  @Input() live = true;
  @Output() search = new EventEmitter<string>();

  protected readonly term = signal('');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.term.set(this.value ?? '');
    }
  }

  updateTerm(value: string): void {
    this.term.set(value);
    if (this.live) {
      this.executeSearch();
    }
  }

  executeSearch(): void {
    this.search.emit(this.term().trim());
  }
}
