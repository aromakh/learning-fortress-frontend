import { Component, Input } from "@angular/core";
import { BrickAttempt, Brick, Pallet } from "../../schema";
import { BrickService } from "./brick.service";

import { BehaviorSubject, Observable } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { BrickTimePipe } from "./brickTime.pipe";
import { TimerService, Timer } from "./timer.service";

@Component({
    selector: 'live-summary',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.scss']
})
export class SummaryComponent {
    brickAttempt: BrickAttempt;
    aBrick: BehaviorSubject<Brick>;
    aPallet: Observable<Pallet>;

    timer: Timer;

    constructor(private bricks: BrickService, timer: TimerService, private brickTime: BrickTimePipe, private router: Router, private route: ActivatedRoute) {
        if(bricks.currentBrickAttempt == null) {
            router.navigate(["../live"], { relativeTo: route });
        }
        this.aBrick = bricks.currentBrick;
        this.brickAttempt = bricks.currentBrickAttempt;
        this.timer = timer.new();
        this.timer.timeResolution = 1000;

        this.aBrick.subscribe(val => {
            if(val) {
                this.aPallet = bricks.currentPallet;
                this.showBrick(val);
            }
        });
    }

    showBrick(brick: Brick) {
        let time = this.brickTime.transform(brick.type, "summary");
        this.timer.countDown(time);
    }

    startBrick() {
        this.router.navigate(['../review'], { relativeTo: this.route })
    }

    next(audio) {
        audio.play();
        setTimeout(() => {
            this.router.navigate(['../review'], { relativeTo: this.route });
        }, 500);
    }
}
