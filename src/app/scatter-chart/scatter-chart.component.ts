import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import Chart from 'chart.js/auto';

interface Data {
  arenaAdjustedXCordABS: string;
  arenaAdjustedYCordABS: string;
}


@Component({
  selector: 'app-scatter-chart',
  templateUrl: './scatter-chart.component.html',
  styleUrl: './scatter-chart.component.css',
  standalone: true,
  imports: [BaseChartDirective],
})
export class ScatterChartComponent implements OnChanges {
  @Input() chartData: Data[] = [];

  chart!: Chart

  ngOnInit(): void {
    const ctx = document.getElementById('scatter') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: this.scatterChartDatasets,
      },
      options: this.scatterChartOptions,
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] && this.chartData) {
      this.scatterChartDatasets[0].data = this.chartData.map((point) => ({
        x: +point.arenaAdjustedXCordABS + 92,
        y: +point.arenaAdjustedYCordABS + 44,
      }));
    }
    this.chart?.update()
  }

  public scatterChartDatasets: ChartConfiguration<'scatter'>['data']['datasets'] =
    [
      {
        data: this.chartData.map((point) => ({
          y: parseFloat(point.arenaAdjustedXCordABS),
          x: parseFloat(point.arenaAdjustedYCordABS),
        })),
        label: 'Goal',
        pointRadius: 3,
      },
    ];

  public scatterChartOptions: ChartConfiguration<'scatter'>['options'] = {
    responsive: false,
    scales: {
      x: {
        display: false,
        min: 0,
        max: 200,
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        min: 0,
        max: 90,
        grid: {
          display: false,
        },
      },
    },
  };
}
