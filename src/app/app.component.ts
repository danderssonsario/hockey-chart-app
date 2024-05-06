/**
 * @fileoverview Angular root component responsible for managing application state and data flow.
 * @packageDocumentation
 */

import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { PanelComponent, SearchData } from './panel/panel.component';
import { ScatterChartComponent } from './scatter-chart/scatter-chart.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';

/**
 * Interface representing the query parameters for fetching data.
 */
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
 * Interface representing the facets data.
 */
interface Facet {
  field: string;
  value: string;
  count?: number;
}

/**
 * Angular root component managing application state and data flow.
 */
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
  chartDatasets: ChartDataWithTeamCode[] = [];

  /**
   * Fetches goal data by team.
   * @param event - The selected team code.
   */
  async getGoalsByTeam(event: any) {
    if (event !== null && event.length) {
      this.disabledPanel = false;
      this.selectedTeams = event;
      const queryObject = await this.#mapEventDataToQueryObject({
        teamCodes: event,
      });
      const params = await this.#buildQueryParams(queryObject);

      const chartDatasets = await this.#fetchChartData(params);
      this.chartDatasets = chartDatasets;
      this.facets = await this.#fetchFacetData();

    } else if (event == null || !event.length) {
      this.disabledPanel = true;
    }
  }

  /**
   * Receives search data from the panel component.
   * @param event - The search data object.
   */
  async receiveSearchData(event: SearchData) {
    const queryObject = await this.#mapEventDataToQueryObject(event);
    const params = await this.#buildQueryParams(queryObject);
    const chartDatasets = await this.#fetchChartData(params);

    this.chartDatasets = chartDatasets;
    this.facets = await this.#fetchFacetData();
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
      const queryString = this.selectedTeams
        .map((team) => `teamCodes=${encodeURIComponent(team)}`)
        .join('&');
      const response = await fetch(
        `http://localhost:5207/indexes/goals/facets?${queryString}`
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
          if (Array.isArray(value)) {
            // If the value is an array, iterate over its elements
            value.forEach((element) => {
              if (element !== '' && element !== null && element !== undefined) {
                queryParams += `${encodeURIComponent(key)}=${encodeURIComponent(
                  element.toString()
                )}&`;
              }
            });
          } else if (typeof value === 'object') {
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

    return queryParams;
  }

  async #mapEventDataToQueryObject(event: any): Promise<QueryObject> {
    const queryObject: QueryObject = {
      TeamCodes: this.selectedTeams || [],
      ShooterName: event.shooterName || '',
      Period: event.period || '',
      ShooterLeftRight: event.shooterLeftRight || '',
      ShotType: event.shotType || '',
      ArenaAdjustedShotDistance: {
        Start: parseFloat(event.arenaAdjustedShotDistance?.start) || 0,
        End: parseFloat(event.arenaAdjustedShotDistance?.end) || 100,
      },
      ShotAngleAdjusted: {
        Start: parseFloat(event.shotAngleAdjusted?.start) || 0,
        End: parseFloat(event.shotAngleAdjusted?.end) || 90,
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
