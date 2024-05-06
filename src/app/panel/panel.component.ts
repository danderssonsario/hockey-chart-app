import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipsModule } from '@angular/material/chips';
import { NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { SliderComponent } from '../slider/slider.component';
import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  EventEmitter,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
} from '@angular/material/autocomplete';

import { AsyncPipe } from '@angular/common';

export interface SearchData {
  shooterName: string;
  period: string;
  shooterLeftRight: string;
  shotType: string;
  arenaAdjustedShotDistance: { start: string; end: string };
  shotAngleAdjusted: { start: string; end: string };
  time: { start: string; end: string };
  isPowerPlay: boolean;
  isBoxPlay: boolean;
  isPlayOffGame: boolean;
  shotOnEmptyNet: boolean;
  shotRebound: boolean;
  [key: string]: string | boolean | object;
}

interface Facet {
  field: string;
  value: string;
  count?: number;
}

/**
 * PanelComponent represents the panel component of the application.
 * It provides a panel for users to apply search filters and emits the search data when changes occur.
 */
@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css',
  standalone: true,
  imports: [
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatChipsModule,
    NgIf,
    MatSelectModule,
    SliderComponent,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
})
export class PanelComponent {
  @ViewChild(MatAccordion)
  accordion: MatAccordion = new MatAccordion();
  panelOpenState = false;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  displayChip = false;

  @ViewChild('nameInput')
  nameInput!: ElementRef<HTMLInputElement>;

  @Input() facets: Facet[] = [];
  ofReboundFacet: Facet | undefined;
  playoffFacet: Facet | undefined;
  powerplayFacet: Facet | undefined;
  boxplayFacet: Facet | undefined;
  emptyNetFacet: Facet | undefined;
  @Input() disabled: Boolean = false;
  @Input() reset: Boolean = false;

  constructor() {
    this.updateOfFacetCount();
  }

  /**
   * Lifecycle hook that is called when any input property changes.
   * It updates the rebound count if facets change.
   * It handles reset if reset input is true.
   *
   * @param changes - SimpleChanges object containing the changed properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['facets'] && changes['facets'].currentValue) {
      this.updateOfFacetCount();
    }
    if (changes['reset'] && changes['reset'].currentValue) {
      this.handleReset();
    }
  }

  /**
   * Updates the facets.
   */
  updateOfFacetCount(): void {
    this.ofReboundFacet = this.facets.find(
      (facet) => facet.field === 'ShotRebound' && facet.value === 'True'
    );
    this.emptyNetFacet = this.facets.find(
      (facet) => facet.field === 'ShotOnEmptyNet' && facet.value === 'True'
    );
    this.playoffFacet = this.facets.find(
      (facet) => facet.field === 'IsPlayOffGame' && facet.value === 'True'
    );
    this.powerplayFacet = this.facets.find(
      (facet) => facet.field === 'IsPowerPlay' && facet.value === 'True'
    );
    this.boxplayFacet = this.facets.find(
      (facet) => facet.field === 'IsBoxPlay' && facet.value === 'True'
    );
  }

  @Output() changeEvent = new EventEmitter<SearchData>();

  /**
   * Adds a chip based on user input.
   *
   * @param event - Event containing the chip value
   */
  add(event: any): void {
    const value = (event.value || '').trim();

    if (value) {
      this.onPanelChange({ key: event.key, value: value });
      this.displayChip = true;
    }

    event.chipInput!.clear();
  }

  /**
   * Removes the chip.
   */
  remove(): void {
    this.onPanelChange({ key: 'shooterName', value: '' });
    this.displayChip = false;
  }

  searchdata: SearchData = {
    shooterName: '',
    period: '',
    shooterLeftRight: '',
    shotType: '',
    arenaAdjustedShotDistance: { start: '0', end: '100' },
    shotAngleAdjusted: { start: '0', end: '90' },
    time: { start: '0', end: '80' },
    isPowerPlay: false,
    isBoxPlay: false,
    isPlayOffGame: false,
    shotOnEmptyNet: false,
    shotRebound: false,
  };

  /**
   * Handles the reset operation by resetting the search data and emitting changes.
   */
  handleReset(): void {
    this.displayChip = false;
    this.searchdata = {
      shooterName: '',
      period: '',
      shooterLeftRight: '',
      shotType: '',
      arenaAdjustedShotDistance: { start: '0', end: '100' },
      shotAngleAdjusted: { start: '0', end: '90' },
      time: { start: '0', end: '80' },
      isPowerPlay: false,
      isBoxPlay: false,
      isPlayOffGame: false,
      shotOnEmptyNet: false,
      shotRebound: false,
    };
    this.changeEvent.emit(this.searchdata);
  }

  /**
   * Handles the change event when a panel item changes.
   *
   * @param event - Event object containing the changed data
   */
  onPanelChange(event: any): void {
    this.searchdata = {
      ...this.searchdata,
      [event.key as keyof SearchData]: event.value,
    };

    this.changeEvent.emit(this.searchdata);
  }
}
