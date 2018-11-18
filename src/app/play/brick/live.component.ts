import { Component, ViewChildren, QueryList, OnInit } from '@angular/core';

import { BrickService } from './brick.service';

import { Brick, Question, BrickAttempt, Student, Pallet } from '../../schema';
import { Observable } from 'rxjs';
import { TimerService, Timer } from './timer.service';
import { BrickTimePipe } from './brickTime.pipe';

import { CompComponent } from './comp/comp.component';
import { QuestionComponent } from './question.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import * as mojs from 'mo-js';
// Important jquery may not look like it is being used but it really is
import * as $ from 'jquery';

function isIOSSafari() {
    let userAgent;
    userAgent = window.navigator.userAgent;
    return userAgent.match(/iPad/i) || userAgent.match(/iPhone/i);
}

function isTouch() {
    let isIETouch;
    isIETouch = navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    return [].indexOf.call(window, 'ontouchstart') >= 0 || isIETouch;
}

// taken from mo.js demos
const isIOS = isIOSSafari(),
    clickHandler = isIOS || isTouch() ? 'touchstart' : 'click';

function extend( a, b ) {
    for (const key in b ) {
        if (b.hasOwnProperty( key ) ) {
            a[key] = b[key];
        }
    }
    return a;
}

function Animocon(el, options) {
    this.el = el;
    this.options = extend( {}, this.options );
    extend( this.options, options );

    this.checked = false;

    this.timeline = new mojs.Timeline();

    for (let i = 0, len = this.options.tweens.length; i < len; ++i) {
        this.timeline.add(this.options.tweens[i]);
    }

    const self = this;
    this.el.addEventListener(clickHandler, function() {
        if (self.checked) {
            self.options.onUnCheck();
        } else {
            self.options.onCheck();
            self.timeline.replay();
        }
        self.checked = !self.checked;
    });
}

Animocon.prototype.options = {
    tweens : [
        new mojs.Burst({})
    ],
    onCheck : function() { return false; },
    onUnCheck : function() { return false; }
};

// Animocon animation function
function init(buttons) {
    buttons.forEach(el1 => {
        const el1span = el1.querySelector('mat-icon');
        const notUsedObj = new Animocon(el1, {
            tweens : [
                // burst animation
                new mojs.Burst({
                    parent: el1,
                    radius: {30: 90},
                    count: 6,
                    children : {
                        fill: '#0076b4',
                        opacity: 0.6,
                        radius: 15,
                        duration: 1700,
                        easing: mojs.easing.bezier(0.1, 1, 0.3, 1)
                    }
                }),
                // ring animation
                new mojs.Shape({
                    parent: 		el1,
                    type: 			'circle',
                    radius: 		{0: 60},
                    fill: 			'transparent',
                    stroke: 		'#0076b4',
                    strokeWidth: {20: 0},
                    opacity: 		0.6,
                    duration: 	700,
                    easing: 		mojs.easing.sin.out
                }),
                // icon scale animation
                new mojs.Tween({
                    // This is longer than the slide transition to next question
                    // But it seems to work ok at the moment
                    duration : 1200,
                    onUpdate: function(progress) {
                        if (progress > 0.3) {
                            const elasticOutProgress = mojs.easing.elastic.out(1.43 * progress - 0.43);
                            el1span.style.WebkitTransform = el1span.style.transform =
                                'scale3d(' + elasticOutProgress + ',' + elasticOutProgress + ',1)';
                        } else {
                            el1span.style.WebkitTransform = el1span.style.transform = 'scale3d(0,0,1)';
                        }
                    }
                })
            ],
            onCheck : function() {
                el1.style.color = '#ffffff';
            },
            onUnCheck : function() {
                el1.style.color = '#0076b4';
            }
        });
    });
}

@Component({
    selector: 'live',
    templateUrl: './live.component.html',
    styleUrls: ['./live.component.scss'],
    providers: [ ]
})
export class LiveComponent implements OnInit {
    constructor(public bricks: BrickService, timer: TimerService, brickTime: BrickTimePipe,
        public router: Router, public route: ActivatedRoute, public auth: AuthService) {
        this.brick = bricks.currentBrick.asObservable();
        this.timer = timer.new();
        this.timer.timeResolution = 1000;
        this.brickTime = brickTime;
        bricks.currentBrick.subscribe((data) => {
            if(data != null) {
                this._brick = data;
                this.showBrick(this._brick);
            }
        });
    }

    brick: Observable<Brick>;
    timer: Timer;

    private _brick: Brick;
    private brickTime: BrickTimePipe;

    @ViewChildren(QuestionComponent) questions: QueryList<QuestionComponent>;

    showBrick(brick: Brick) {
        let time = this.brickTime.transform(brick.type, "live");
        this.timer.countDown(time);
        this.timer.timeRanOut.subscribe((t) => {
            this.finishBrick();
        });
    }

    ngOnInit() {
        // Poll to check for button elements with icobutton class
        setTimeout(function() {
            const items = [].slice.call(document.querySelectorAll('button.icobutton'));
            init(items);
        }, 500);
    }

    goForward(stepper) {
        setTimeout(function() {
            stepper.next();
        }, 500);
    }

    getStepperScroll() {
        return document.getElementsByClassName('mat-horizontal-stepper-header-container')[0];
    }

    scrollLeft() {
        const el = this.getStepperScroll();
        el.scrollLeft -= 30;
    }

    scrollRigth() {
        const el = this.getStepperScroll();
        el.scrollLeft += 30;
    }

    finishBrick() {
        this.timer.stop();
        console.log("finished in " + this.timer.timeElapsed.getTime() / 1000);

        // Get brick data
        this.auth.user.subscribe((user) => {
            let answers = this.questions.map((question) => {
                return question.getAttempt();
            })
            let score = answers.reduce((acc, answer) => acc + answer.marks, 0);
            let maxScore = answers.reduce((acc, answer) => acc + answer.maxMarks, 0);
            var ba : BrickAttempt = {
                brick: this._brick._ref,
                score: score,
                maxScore: maxScore,
                student: this.bricks.database.afs.doc("students/" + user.uid).ref,
                answers: answers
            };
            console.log(`score is ${score} out of ${maxScore}, which is ${score * 100 / maxScore}%`);
            this.bricks.currentBrickAttempt = ba;
            this.router.navigate(['../provisionalScore'], { relativeTo: this.route });
        })
    }

}
