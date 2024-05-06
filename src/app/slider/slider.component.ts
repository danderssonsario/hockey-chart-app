/**
 * @fileoverview Angular component for a slider input.
 * @packageDocumentation
 */

import { Component, Input, EventEmitter, Output } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';

/**
 * Interface representing the data for the slider component.
 */
interface Data {
  min: string;
  max: string;
  start: string;
  end: string;
  step: string;
  header: string;
  key: string;
}

/**
 * Interface representing the data emitted by the slider.
 */
interface emitData {
  key: string;
  value: { start: string; end: string };
}

/**
 * Angular component to render a slider input.
 */
@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css',
  standalone: true,
  imports: [MatSliderModule, MatCardModule],
})
export class SliderComponent {
  /**
   * Input data for the slider component.
   */
  @Input()
  data: Data = {
    min: '',
    max: '',
    start: '',
    end: '',
    step: '',
    header: '',
    key: '',
  };

  /**
   * Event emitter for when the slider value changes.
   */
  @Output()
  sliderChange: EventEmitter<emitData> = new EventEmitter<emitData>();

  /**
   * Handles the change event of the slider.
   * @param event - The event object containing the slider value.
   */
  onChange(event: any) {
    this.data = { ...this.data, [event.target.name]: event.target.value };
    this.sliderChange.emit({
      key: this.data.key,
      value: { start: this.data.start, end: this.data.end },
    });
  }

  /**
   * Formats the label of the slider.
   * @param value - The value of the slider.
   * @returns The formatted label.
   */
  formatLabel(value: number): string {
    const intStep = parseInt(this.data?.step);

    if (value >= intStep) {
      return `${Math.round(value / intStep)}`;
    }

    return `${value}`;
  }
}
