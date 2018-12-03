import { Component, Input } from "@angular/core";
import { Timer } from "./timer.service";

@Component({
    selector: 'timer',
    template: `
    <div class="timer-container" [attr.data-intro]="showIntro ? 'The countdown in each section helps to keep you on track to get the work done in 20, 40 or 60 minutes. Depending on the brick type' : null " data-step="1">
        <mat-card class="timer" [ngStyle]="{color: isRed ? '#E30000' : 'black'}">
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
    @Input() isRed: boolean;
    @Input() showIntro: boolean;
}
