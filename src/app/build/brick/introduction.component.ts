import { Component } from '@angular/core';

import { ActivatedRoute, Router, ParamMap } from '@angular/router';

import { switchMap } from 'rxjs/operators';

import { Brick, Pallet } from '../../schema';
import { BrickService } from './brick.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { TimerService, Timer } from './timer.service';
import { BrickTimePipe } from './brickTime.pipe';

@Component({
    selector: 'introduction',
    templateUrl: './introduction.component.html',
    styleUrls: ['./introduction.component.scss']
})
export class IntroductionComponent {
    constructor(private bricks: BrickService, timer: TimerService, private brickTime: BrickTimePipe, private router: Router, private route: ActivatedRoute) {
        this.timer = timer.new();
        this.timer.timeResolution = 1000;
        this.aBrick = bricks.currentBrick;
        this.aBrick.subscribe(val => {
            if(val != null) {
                this.aPallet = bricks.currentPallet;
                this.showBrick(val);
            }
        });
    }

    aBrick: BehaviorSubject<Brick>;
    aPallet: Observable<Pallet>;
    timer: Timer;

    showBrick(brick: Brick) {
        let time = this.brickTime.transform(brick.type, "intro");
        this.timer.countDown(time);
    }

    startBrick() {
        this.router.navigate(['../live'], { relativeTo: this.route })
    }
}
