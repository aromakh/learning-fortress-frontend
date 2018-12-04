import { Component, Input, AfterViewInit } from "@angular/core";
import { BrickAttempt, Brick, Pallet } from "../../schema";
import { BrickService } from "./brick.service";

import { BehaviorSubject, Observable } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";

import * as introJs from "intro.js";
import { IntroService } from "src/app/intro.service";
import { AuthService } from "src/app/auth/auth.service";

@Component({
    selector: 'live-ending',
    templateUrl: './ending.component.html',
    styleUrls: ['./summary.component.scss']
})
export class EndingComponent implements AfterViewInit {
    brickAttempt: BrickAttempt;
    aBrick: BehaviorSubject<Brick>;
    aPallet: Observable<Pallet>;
    _brick: Brick

    constructor(
        private bricks: BrickService, private router: Router, private route: ActivatedRoute,
        private auth: AuthService, private introService: IntroService
    ) {
        if(bricks.currentBrickAttempt == null) {
            router.navigate(["../live"], { relativeTo: route });
        }
        this.aBrick = bricks.currentBrick;
        this.aBrick.subscribe(val => {
            if(val) {
                this.aPallet = bricks.currentPallet;
                this._brick = val;
            }
        });
        this.brickAttempt = bricks.currentBrickAttempt;
        bricks.publishBrickAttempt(this.brickAttempt);
    }

    ngAfterViewInit() {
        // IntroJS if new user and not skipped
        if (this.auth.isNewUser && !this.introService.isSkipped) {
            this.introService.start(this.next.bind(this));
        }
    }

    next() { this.router.navigate(['play', 'pallet', this._brick.pallet.id]); }

    finish(audio) {
        audio.play();
        audio.onended = this.next.bind(this);
        this.bricks.currentBrick = null;
        this.bricks.currentBrickAttempt = null;
    }
}
