import { Component, EventEmitter, Output } from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';



@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  standalone: true,
})
export class HeaderComponent {
  @Output() teamSelectionChange: EventEmitter<string> = new EventEmitter<
    string
  >();

  teams = new FormControl('');

  teamList: { name: string; teamCode: string }[] = [
    { name: 'Anaheim Ducks', teamCode: 'ANA'},
    { name: 'Arizona Coyotes', teamCode: 'ARI' },
    { name: 'Boston Bruins', teamCode: 'BOS' },
    { name: 'Buffalo Sabres', teamCode: 'BUF' },
    { name: 'Calgary Flames', teamCode: 'CGY' },
    { name: 'Carolina Hurricanes', teamCode: 'CAR' },
    { name: 'Chicago Blackhawks', teamCode: 'CHI' },
    { name: 'Colorado Avalanche', teamCode: 'COL' },
    { name: 'Columbus Blue Jackets', teamCode: 'CBJ' },
    { name: 'Dallas Stars', teamCode: 'DAL' },
    { name: 'Detroit Red Wings', teamCode: 'DET' },
    { name: 'Edmonton Oilers', teamCode: 'EDM' },
    { name: 'Florida Panthers', teamCode: 'FLA' },
    { name: 'Los Angeles Kings', teamCode: 'LAK' },
    { name: 'Minnesota Wild', teamCode: 'MIN' },
    { name: 'Montreal Canadiens', teamCode: 'MTL' },
    { name: 'Nashville Predators', teamCode: 'NSH' },
    { name: 'New Jersey Devils', teamCode: 'NJD' },
    { name: 'New York Islanders', teamCode: 'NYI' },
    { name: 'New York Rangers', teamCode: 'NYR' },
    { name: 'Ottawa Senators', teamCode: 'OTT' },
    { name: 'Philadelphia Flyers', teamCode: 'PHI' },
    { name: 'Pittsburgh Penguins', teamCode: 'PIT' },
    { name: 'San Jose Sharks', teamCode: 'SJS' },
    { name: 'Seattle Kraken', teamCode: 'SEA' },
    { name: 'St. Louis Blues', teamCode: 'STL' },
    { name: 'Tampa Bay Lightning', teamCode: 'TBL' },
    { name: 'Toronto Maple Leafs', teamCode: 'TOR' },
    { name: 'Vancouver Canucks', teamCode: 'VAN' },
    { name: 'Vegas Golden Knights', teamCode: 'VGK' },
    { name: 'Washington Capitals', teamCode: 'WSH' },
    { name: 'Winnipeg Jets', teamCode: 'WPG' },
  ];

  handleTeamSelectionChange(event: any): void {
    this.teamSelectionChange.emit(event.value);
  }
}
