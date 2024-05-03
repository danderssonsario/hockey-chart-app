import { Component, Input, EventEmitter, Output } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';
import { parse } from 'jest-editor-support';

interface Data {
  min: string,
  max: string,
  start: string,
  end: string,
  step: string,
  header: string,
  key: string
}

interface emitData {
  key: string;
  value: { start: string, end: string };
}

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css',
  standalone: true,
  imports: [MatSliderModule, MatCardModule],
})
export class SliderComponent {
  @Input()
  data: Data = {
    min: '',
    max: '',
    start: '',
    end: '',
    step: '',
    header: '',
    key: ''
  };

  @Output()
  sliderChange: EventEmitter<emitData> = new EventEmitter<emitData>();

  onChange(event: any) {
    this.data = { ...this.data, [event.target.name]: event.target.value };
    this.sliderChange.emit( { key: this.data.key, value: { start: this.data.start, end: this.data.end }})
  }

  formatLabel(value: number): string {
    const intStep = parseInt(this.data?.step)

    if (value >= intStep) {
      return `${Math.round(value / intStep)}`;
    }

    return `${value}`;
  }
}
