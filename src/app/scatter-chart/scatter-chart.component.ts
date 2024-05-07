/**
 * @fileoverview Angular component for displaying a scatter chart.
 * @packageDocumentation
 */

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import Chart from 'chart.js/auto';

// Define interface for chart data with TeamCode
interface ChartDataWithTeamCode {
  teamCode: string;
  data: Data[];
}

/**
 * Interface representing the data for each point on the scatter chart.
 */
interface Data {
  arenaAdjustedXCordABS: string;
  arenaAdjustedYCordABS: string;
}

/**
 * Angular component to render a scatter chart.
 */
@Component({
  selector: 'app-scatter-chart',
  templateUrl: './scatter-chart.component.html',
  styleUrl: './scatter-chart.component.css',
  standalone: true,
  imports: [BaseChartDirective],
})
export class ScatterChartComponent implements OnChanges {
  /**
   * Input data for the scatter chart.
   */
  @Input() chartDatasets: ChartDataWithTeamCode[] = [];

  /**
   * The Chart.js instance for the scatter chart.
   */
  chart!: Chart;

  /**
   * Initializes the scatter chart when the component is created.
   */
  ngOnInit(): void {
    const ctx = document.getElementById('scatter') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [],
      },
      options: this.scatterChartOptions,
    });
  }

  /**
   * Updates the scatter chart when input data changes.
   * @param changes - Object containing the changed properties.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartDatasets'] && this.chartDatasets) {
      if (this.chart) {
        this.chart.data.datasets = [];
      }
      // Render each dataset separately
      this.chartDatasets.forEach((teamData) => {
        const dataset = {
          data: teamData.data.map((point: Data) => ({
            x: +point.arenaAdjustedXCordABS + 135,
            y: +point.arenaAdjustedYCordABS + 50,
          })),
          label: teamData.teamCode,
          pointRadius: 3,
        };
        this.chart.data.datasets.push(dataset);
      });
      this.chart?.update();
    }
  }

  /**
   * Configuration options for the scatter chart.
   */
  public scatterChartOptions: ChartConfiguration<'scatter'>['options'] = {
    responsive: false,
    scales: {
      x: {
        display: false,
        min: 0,
        max: 250,
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        min: 0,
        max: 100,
        grid: {
          display: false,
        },
      },
    },
  };
}
