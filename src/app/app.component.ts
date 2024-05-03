import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { PanelComponent, SearchData } from './panel/panel.component';
import { ScatterChartComponent } from './scatter-chart/scatter-chart.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';

interface QueryObject {
  ShooterName: string;
  Period: string;
  ShooterLeftRight: string;
  ShotType: string;
  ArenaAdjustedShotDistance: { Start: number; End: number };
  ShotAngleAdjusted: { Start: number; End: number };
  Time: { Start: number; End: number };
  IsPowerPlay: boolean;
  IsBoxPlay: boolean;
  IsPlayOffGame: boolean;
  ShotOnEmptyNet: boolean;
  ShotRebound: boolean;
  [key: string]: string | boolean | object;
}

interface Data {
  arenaAdjustedXCordABS: string;
  arenaAdjustedYCordABS: string;
}

interface ChartData {
  data: Data[];
}

interface Facet {
  field: string;
  value: string;
  count?: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [
    HeaderComponent,
    PanelComponent,
    ScatterChartComponent,
    MatProgressBarModule,
    MatCardModule,
  ],
})
export class AppComponent {
  chartData: Data[] = [];
  facets: Facet[] = [];
  isLoading: boolean = false;

  async ngOnInit(): Promise<void> {
    try {
      this.isLoading = true;
      const params = '';
      const chartData = await this.#fetchChartData(params);
      const facetData = await this.#fetchFacetData();
      this.chartData = chartData;
      this.facets = facetData;
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async receiveSearchData(event: SearchData) {
    const queryObject = await this.#mapEventDataToQueryObject(event);
    const params = await this.#buildQueryParams(queryObject);
    const chartData = await this.#fetchChartData(params);

    this.chartData = chartData;
  }

  async #fetchChartData(params: any): Promise<any> {
    try {
      this.isLoading = true;
      const param = new URLSearchParams(params).toString();
      const response = await fetch(
        `http://localhost:5207/indexes/goals?${param}`
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async #fetchFacetData(): Promise<any> {
    try {
      this.isLoading = true;
      const response = await fetch(
        `http://localhost:5207/indexes/goals/facets`
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async #buildQueryParams(queryObject: QueryObject): Promise<string> {
    let queryParams = '';

    for (const key in queryObject) {
      if (queryObject.hasOwnProperty(key)) {
        const value = queryObject[key];
        if (value !== '' && value !== null && value !== undefined) {
          if (typeof value === 'object') {
            // If the value is an object, stringify it
            const subParams = Object.entries(value)
              .map(([subKey, subValue]) => {
                if (
                  subValue !== '' &&
                  subValue !== null &&
                  subValue !== undefined
                ) {
                  return `${encodeURIComponent(key)}.${encodeURIComponent(
                    subKey
                  )}=${encodeURIComponent(subValue.toString())}`;
                }
                return '';
              })
              .filter((param) => param !== '')
              .join('&');
            queryParams += subParams + '&';
          } else {
            // Otherwise, add the key-value pair to the query parameters
            queryParams += `${encodeURIComponent(key)}=${encodeURIComponent(
              value.toString()
            )}&`;
          }
        }
      }
    }

    // Remove the trailing '&' character
    queryParams = queryParams.slice(0, -1);

    return queryParams;
  }

  async #mapEventDataToQueryObject(event: SearchData): Promise<QueryObject> {
    const queryObject: QueryObject = {
      ShooterName: event.shooterName || '',
      Period: event.period || '',
      ShooterLeftRight: event.shooterLeftRight || '',
      ShotType: event.shotType || '',
      ArenaAdjustedShotDistance: {
        Start: parseFloat(event.arenaAdjustedShotDistance?.start) || 0,
        End: parseFloat(event.arenaAdjustedShotDistance?.end) || 200,
      },
      ShotAngleAdjusted: {
        Start: parseFloat(event.shotAngleAdjusted?.start) || 0,
        End: parseFloat(event.shotAngleAdjusted?.end) || 180,
      },
      Time: {
        Start: parseInt(event.time?.start) * 60 || 0,
        End: parseInt(event.time?.end) * 60 || 3600,
      },
      IsPowerPlay: event.isPowerPlay,
      IsBoxPlay: event.isBoxPlay,
      IsPlayOffGame: event.isPlayOffGame,
      ShotOnEmptyNet: event.shotOnEmptyNet,
      ShotRebound: event.shotRebound,
    };

    return queryObject;
  }
}
