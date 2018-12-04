import { Component, AfterViewInit } from '@angular/core';

import { ActivatedRoute, Router, ParamMap } from '@angular/router';

import { switchMap } from 'rxjs/operators';

import { Brick, Pallet } from '../../schema';
import { BrickService } from './brick.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { TimerService, Timer } from './timer.service';
import { BrickTimePipe } from './brickTime.pipe';

import * as introJs from 'intro.js';
import { AuthService } from 'src/app/auth/auth.service';
import { IntroService } from 'src/app/intro.service';

@Component({
    selector: 'introduction',
    templateUrl: './introduction.component.html',
    styleUrls: ['./introduction.component.scss']
})
export class IntroductionComponent implements AfterViewInit {
    private html: string = "";

    constructor(
        private bricks: BrickService, timer: TimerService, private brickTime: BrickTimePipe, private router: Router,
        private route: ActivatedRoute, private auth: AuthService, private introService: IntroService
    ) {
            this.timer = timer.new();
            this.timer.timeResolution = 1000;
            this.aBrick = bricks.currentBrick;
            this.aBrick.subscribe(val => {
            if (val != null) {
                this.aPallet = bricks.currentPallet;
                this.showBrick(val);
            }
        });
    }

    aBrick: BehaviorSubject<Brick>;
    aPallet: Observable<Pallet>;
    timer: Timer;

    ngAfterViewInit() {
        // IntroJS if new user and not skipped
        if (this.auth.isNewUser && !this.introService.isSkipped) {
            this.introService.start(this.next.bind(this));
        }
    }

    showBrick(brick: Brick) {
        let time = this.brickTime.transform(brick.type, "intro");
        this.timer.countDown(time);
    }

    next() { this.router.navigate(['../live'], { relativeTo: this.route }); }

    startBrick(audio) {
        audio.play();
        audio.onended = this.next.bind(this);
    }
}
