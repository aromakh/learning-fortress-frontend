import { Component, ViewChildren, QueryList, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Brick, BrickAttempt, QuestionAttempt } from "../../schema";
import { Timer, TimerService } from "./timer.service";
import { BrickTimePipe } from "./brickTime.pipe";
import { BrickService } from "./brick.service";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../auth/auth.service";
import { QuestionComponent } from "./question.component";
import { animateButtons } from "src/app/animocon/button";
import { Sounds } from "src/app/sounds/sounds";

@Component({
    selector: 'live-review',
    templateUrl: './review.component.html',
    styleUrls: ['./live.component.scss']
})
export class ReviewComponent implements OnInit {
    constructor(public bricks: BrickService, timer: TimerService, brickTime: BrickTimePipe, public router: Router, public route: ActivatedRoute, public auth: AuthService) {
        this.brick = bricks.currentBrick.asObservable();
        this.brickAttempt = bricks.currentBrickAttempt;
        if(!this.brickAttempt) {
            this.router.navigate(['../live'], {relativeTo: route});
        }
        this.timer = timer.new();
        this.timer.timeResolution = 1000;
        this.brickTime = brickTime;
        bricks.currentBrick.subscribe((data) => {
            if(data != null) {
                this._brick = data;
                this.showBrick(this._brick);
            }
        })
    }

    brick: Observable<Brick>;
    brickAttempt: BrickAttempt;
    timer : Timer;

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

    goForward(stepper, audios) {
        setTimeout(function() {
            stepper.next();
        }, 500);

        audios.forEach(audio => {
            setTimeout(function() { audio.play(); }, parseInt(audio.getAttribute('delay'), 10));
        });
    }

    finishBrick(sound) {
        sound.play();

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
            setTimeout(() => {
                this.router.navigate(["../ending"], { relativeTo: this.route });
            }, 500);
        });
    }
}
