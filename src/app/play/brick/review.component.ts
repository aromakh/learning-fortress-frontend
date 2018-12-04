import { Component, ViewChildren, QueryList, OnInit, AfterViewInit } from "@angular/core";
import { Observable } from "rxjs";
import { Brick, BrickAttempt, QuestionAttempt } from "../../schema";
import { Timer, TimerService } from "./timer.service";
import { BrickTimePipe } from "./brickTime.pipe";
import { BrickService } from "./brick.service";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../auth/auth.service";
import { QuestionComponent } from "./question.component";
import { animateButtons } from "src/app/animocon/button";

import * as introJs from "intro.js";
import { IntroService } from "src/app/intro.service";

@Component({
    selector: 'live-review',
    templateUrl: './review.component.html',
    styleUrls: ['./live.component.scss']
})
export class ReviewComponent implements OnInit, AfterViewInit  {
    constructor(public bricks: BrickService, timer: TimerService, brickTime: BrickTimePipe, public router: Router,
        public route: ActivatedRoute, public auth: AuthService, private introService: IntroService) {
        this.brick = bricks.currentBrick.asObservable();
        this.brickAttempt = bricks.currentBrickAttempt;
        if (!this.brickAttempt) {
            this.router.navigate(['../live'], {relativeTo: route});
        }
        this.timer = timer.new();
        this.timer.timeResolution = 1000;
        this.brickTime = brickTime;
        bricks.currentBrick.subscribe((data) => {
            if (data != null) {
                this._brick = data;
                this.showBrick(this._brick);
            }
        });
    }

    brick: Observable<Brick>;
    brickAttempt: BrickAttempt;
    timer: Timer;

    private _brick: Brick;
    private brickTime: BrickTimePipe;

    @ViewChildren(QuestionComponent) questions : QueryList<QuestionComponent>;

    showBrick(brick: Brick) {
        let time = this.brickTime.transform(brick.type, "review");
        this.timer.countDown(time);
        this.timer.timeRanOut.subscribe((t) => {
            this.finishBrick();
        })
    }

    ngOnInit() {
        // Poll to check for button elements with icobutton class
        setTimeout(function() {
            const items = [].slice.call(document.querySelectorAll('button.icobutton'));
            animateButtons(items, []);
        }, 500);
    }

    ngAfterViewInit() {
        // IntroJS if new user and not skipped
        if (this.auth.isNewUser && !this.introService.isSkipped) {
            this.introService.start(this.finishBrick.bind(this));
        }
    }

    goForward(stepper, audios) {
        setTimeout(function() {
            stepper.next();
        }, 500);

        audios.forEach(audio => {
            setTimeout(function() { audio.play(); }, parseInt(audio.getAttribute('delay'), 10));
        });
    }

    next() { this.router.navigate(['../ending'], { relativeTo: this.route }); }

    finishBrick(sound = null) {
        this.timer.stop();
        console.log("finished in " + this.timer.timeElapsed.getTime() / 1000);

        // Get brick data
        this.auth.user.subscribe((user) => {
            let answers = this.questions.map((question) => {
                return question.getAttempt();
            })
            let score = answers.reduce((acc, answer) => acc + answer.marks, 0) + this.bricks.currentBrickAttempt.score;
            var ba : BrickAttempt = {
                brick: this._brick._ref,
                score: score,
                oldScore: this.bricks.currentBrickAttempt.score,
                maxScore: this.bricks.currentBrickAttempt.maxScore,
                student: this.bricks.database.afs.doc("students/"+user.uid).ref,
                answers: answers
            };
            console.log(`score is ${score} out of ${this.bricks.currentBrickAttempt.maxScore}, which is ${score * 100 / this.bricks.currentBrickAttempt.maxScore}%`);
            this.bricks.currentBrickAttempt = ba;
            if (sound) {
                sound.play();
                sound.onended = this.next.bind(this);
            } else {
                this.next();
            }
        });
    }
}
