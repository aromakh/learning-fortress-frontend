import { Component, Input } from "@angular/core";
import { Timer } from "./timer.service";

@Component({
    selector: 'timer',
    template: `
    <div class="timer-container">
        <mat-card class="timer">
            {{ timer.timeLeft?.valueOf() / 1000 }}
        </mat-card>
    </div>
    `,
    styles: [
        `
        .timer-container {
            position: fixed;
            bottom: 5px;
            right: 5px;
            display: flex;
            z-index: 100;
        }

        .timer {
            font-size: 20px;
            background-color: #fff;
        }
        `
    ]
})
export class TimerComponent {
    @Input() timer: Timer;
}
