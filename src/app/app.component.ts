import { Component, HostListener } from '@angular/core';
import { timer } from 'rxjs'
import { map, switchMap, take } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  sharedData: any = {
    type: 'details',
    players: 2,
    playersWon: [],
    playerRank: 1
  }
  rolling = false;
  selectedRollCount = 1;
  selectedType = 6;
  start$ = new Subject();
  number: Number;
  roller$ = this.start$
    .pipe(
      switchMap(() => {
        let count = 0;
        return timer(0, 50).pipe(take(20), map(_ => {
          let total = 0;
          for (let i = 0; i < this.selectedRollCount; i++) {
            total += this.calcRoll(6);
          }
          count++;
          if (count == 20) {
            this.number = total;
            setTimeout(() => {
              this.calculatePlayer(total)
            })
          }
          return total
        }))
      })
    );
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key == 'r' || event.key == 'R') {
      this.start();
    }
  }

  constructor(
    private _snackBar: MatSnackBar
  ) { }


  calculatePlayer(value) {
    this.sharedData.disableButton = false;
    let score = this.sharedData.data[this.sharedData.currentPlayer].score + value;
    if (score == this.sharedData.score) {
      this.sharedData.data[this.sharedData.currentPlayer].score += value;
      this._snackBar.open(`${this.sharedData.data[this.sharedData.currentPlayer].name} won`, 'Done', {
        duration: 2000,
      });
      this.sharedData.playersWon.push({
        ...this.sharedData.data[this.sharedData.currentPlayer],
        rank: this.sharedData.playerRank
      })
      this.sharedData.data.splice(this.sharedData.currentPlayer, 1);
      this.sharedData.players--;
      this.sharedData.playerRank++;
      if (this.sharedData.currentPlayer >= this.sharedData.players - 1) {
        this.sharedData.currentPlayer = 0;
      } else {
        this.sharedData.currentPlayer++;
      }
    } else {
      if (this.sharedData.data[this.sharedData.currentPlayer].isPlay) {
        if (score > this.sharedData.score) {
          this._snackBar.open(`Score High`, 'Done', {
            duration: 2000,
          });
        } else {
          this.sharedData.data[this.sharedData.currentPlayer].score += value;
        }
      } else {
        this.sharedData.data[this.sharedData.currentPlayer].isPlay = true;
        if (this.sharedData.currentPlayer == this.sharedData.players - 1) {
          this.sharedData.currentPlayer = 0;
        } else {
          this.sharedData.currentPlayer++;
        }
        this.sharedData.data[this.sharedData.currentPlayer].score += value;
      }
      this.checkPlayer(value);
      this.sharedData.data[this.sharedData.currentPlayer].diceValue = value;

      if (value != 6) {
        if (this.sharedData.currentPlayer == this.sharedData.players - 1) {
          this.sharedData.currentPlayer = 0;
        } else {
          this.sharedData.currentPlayer++;
        }
      } else {
        this._snackBar.open(`Its a 6. Roll the dice again....`, 'Done', {
          duration: 2000,
        });
      }
    }
    this.sortRank()

  }

  sortRank() {
    this.sharedData.data.sort((a, b) => a.score < b.score ? 1 : (b.score < a.score ? -1 : 1))
  }


  checkPlayer(value) {
    let diceValue = this.sharedData.data[this.sharedData.currentPlayer].diceValue;
    if (value == 1 && diceValue == 1) {
      this.sharedData.data[this.sharedData.currentPlayer].isPlay = false;
      this._snackBar.open(`Your Next Turn Is Missed`, 'Done', {
        duration: 2000,
      });
    }
  }

  calcRoll(max: number) {
    const min = 1;
    let number = Number((Math.random() * (max - min) + min).toFixed(0));
    return number
  }

  start() {
    this.sharedData.disableButton = true;
    this.start$.next();
  }


  startGame() {
    this.sharedData.data = []
    for (let i = 0; i < this.sharedData.players; i++) {
      this.sharedData.data.push({
        name: `Player ${i + 1}`,
        score: 0,
        id: i,
        diceValue: 0,
        isPlay: true
      })
    }
    this.sharedData.type = 'game'
    this.sharedData.currentPlayer = 0;
  }
}
