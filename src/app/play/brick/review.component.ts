import { Component, ViewChildren, QueryList, AfterViewInit, ElementRef } from "@angular/core";
import { Observable } from "rxjs";
import { Brick, BrickAttempt, QuestionAttempt } from "../../schema";
import { Timer, TimerService } from "./timer.service";
import { BrickTimePipe } from "./brickTime.pipe";
import { BrickService } from "./brick.service";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../auth/auth.service";
import { QuestionComponent } from "./question.component";

@Component({
    selector: 'live-review',
    templateUrl: './review.component.html',
    styleUrls: ['./live.component.scss']
})
export class ReviewComponent implements AfterViewInit {
    constructor(
        public bricks: BrickService, timer: TimerService, brickTime: BrickTimePipe,
        public router: Router, public route: ActivatedRoute, public auth: AuthService,
        public elem: ElementRef
    ) {
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

    /* Stepper header buttons */
    getStepperScroll() {
        return this.elem.nativeElement.querySelectorAll('.mat-horizontal-stepper-header-container')[0];
    }

    scrollLeft(stepper) { stepper.previous(); }
    scrollRigth(stepper) { stepper.next(); }

    makeVisibleButton(button) {
        button.style.position = 'relative';
        button.style.opacity = 1;
    }

    // when view is setted up add buttons to stepper by angular ref and row js
    ngAfterViewInit() {
        const element = this.getStepperScroll();
        const scrollLeftBtn = this.elem.nativeElement.querySelectorAll('#scrollLeft')[0];
        const scrollRightBtn = this.elem.nativeElement.querySelectorAll('#scrollRight')[0];
        this.makeVisibleButton(scrollLeftBtn);
        this.makeVisibleButton(scrollRightBtn);
        element.style.display = 'inline-flex';
        const stepper = element.parentElement;
        stepper.insertBefore(scrollLeftBtn, element);
        stepper.insertBefore(scrollRightBtn, element.nextSibling);
        element.style.width = stepper.offsetWidth - scrollLeftBtn.offsetWidth - scrollRightBtn.offsetWidth - 5 + 'px';
    }
    /* Stepper header buttons */

    finishBrick() {
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
            this.router.navigate(["../ending"], { relativeTo: this.route });
        })
    }
}
