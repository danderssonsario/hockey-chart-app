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
  selectedTeams: string[] = [];
  isLoading: boolean = false;
  disabledPanel: Boolean = true;
  selectedTeam: string = '';
  resetPanel: Boolean = false;

  async getGoalsByTeam(event: string) {
    if (event !== null && event.length) {
      this.disabledPanel = false
    }
    this.selectedTeam = event
    const queryObject = await this.#mapEventDataToQueryObject({ teamCode: event });
    const params = await this.#buildQueryParams(queryObject);
    const chartData = await this.#fetchChartData(params);

    this.chartData = chartData;
    this.facets = await this.#fetchFacetData()
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
        `https://api20240419093055.azurewebsites.net/indexes/goals?${param}`
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
        `https://api20240419093055.azurewebsites.net/indexes/goals/facets?teamCode=${this.selectedTeam}`
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

  async #mapEventDataToQueryObject(event: any): Promise<QueryObject> {
    const queryObject: QueryObject = {
      TeamCode: this.selectedTeam,
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
