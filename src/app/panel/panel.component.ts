import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipsModule } from '@angular/material/chips';
import { NgIf } from '@angular/common';
import {MatSelectModule} from '@angular/material/select';
import { SliderComponent } from '../slider/slider.component';
import { Component, ElementRef, Input, ViewChild, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteSelectedEvent,
  MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
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
  nameCtrl = new FormControl('');
  filteredNames: Observable<string[]>;
  allNames: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];

  @ViewChild('nameInput')
  nameInput!: ElementRef<HTMLInputElement>;

  @Input() facets: Facet[] = [];
  ofReboundFacet: Facet | undefined;
  playoffFacet: Facet | undefined;
  powerplayFacet: Facet | undefined;
  boxplayFacet: Facet | undefined;
  emptyNetFacet: Facet | undefined;

  constructor() {
    this.filteredNames = this.nameCtrl.valueChanges.pipe(
      startWith(null),
      map((name: string | null) =>
        name ? this._filter(name) : this.allNames.slice()
      )
    );
    this.updateOfReboundCount();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['facets'] && changes['facets'].currentValue) {
      this.updateOfReboundCount();
    }
  }

  updateOfReboundCount(): void {
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

  add(event: any): void {
    const value = (event.value || '').trim();

    if (value) {
      this.onPanelChange({ key: event.key, value: value });
      this.displayChip = true;
    }

    event.chipInput!.clear();
    this.nameCtrl.setValue(null);
  }

  remove(): void {
    this.onPanelChange({ key: 'shooterName', value: '' });
    this.displayChip = false;
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    //this.names.push(event.option.viewValue);
    this.nameInput.nativeElement.value = '';
    this.nameCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allNames.filter((name) =>
      name.toLowerCase().includes(filterValue)
    );
  }

  searchdata: SearchData = {
    shooterName: '',
    period: '',
    shooterLeftRight: '',
    shotType: '',
    arenaAdjustedShotDistance: { start: '0', end: '200' },
    shotAngleAdjusted: { start: '0', end: '180' },
    time: { start: '0', end: '80' },
    isPowerPlay: false,
    isBoxPlay: false,
    isPlayOffGame: false,
    shotOnEmptyNet: false,
    shotRebound: false,
  };

  handleReset(): void {
    this.displayChip = false;
    this.searchdata = {
      shooterName: '',
      period: '',
      shooterLeftRight: '',
      shotType: '',
      arenaAdjustedShotDistance: { start: '0', end: '200' },
      shotAngleAdjusted: { start: '0', end: '180' },
      time: { start: '0', end: '80' },
      isPowerPlay: false,
      isBoxPlay: false,
      isPlayOffGame: false,
      shotOnEmptyNet: false,
      shotRebound: false,
    };
    this.changeEvent.emit(this.searchdata);
  }

  onPanelChange(event: any): void {
    this.searchdata = {
      ...this.searchdata,
      [event.key as keyof SearchData]: event.value,
    };

    this.changeEvent.emit(this.searchdata);
  }

  async onInputChange(event: any) {
    const data = await this.#fetchChartData(event.target.value);
  }

  async #fetchChartData(param: string): Promise<any> {
    try {
      const response = await fetch(
        `http://localhost:5207/indexes/goals/suggestions?searchText=${param}`
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
}
