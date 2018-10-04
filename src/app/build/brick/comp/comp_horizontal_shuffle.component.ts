import { Component, Input } from '@angular/core';

import { Comp, ComponentAttempt } from '../../../schema';
import { register } from './comp_index';
import { CompComponent } from "./comp.component";

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export class CompHorizontalShuffle extends Comp {
    name = "Horizontal Shuffle";
    data: { choices: string[], reveal: string }

    constructor(data: {choices: string[], reveal:string}) {
        super();
        this.data = data;
    }
}

@register("HorizontalShuffle")
@Component({
    selector: 'horizontal-shuffle',
    template: `
    <div class="horizontal-shuffle-container" [dragula]="'DRAG'" [(dragulaModel)]="userChoices" fxLayout.gt-xs="row wrap" fxLayout.xs="column" fxLayoutAlign.xs="center center">
        <mat-card touch-action="none" fxFlex.gt-xs="1 0 15%" fxFlex.xs="0 0 0" class="horizontal-shuffle-item touch-list-item" *ngFor="let choice of userChoices; let i = index">
            <div fittext>{{choice}}</div>
        </mat-card>
    </div>
    <p *ngIf="attempt">{{data.data.reveal}}</p>
    `,
    styleUrls: ['../live.component.scss']
})
export class HorizontalShuffleComponent extends CompComponent {
    @Input() data: CompHorizontalShuffle;

    userChoices: string[];

    ngOnInit() {
        this.userChoices = shuffle(this.data.data.choices.slice());
        if(this.attempt) {
            this.userChoices = this.attempt.answer.map(val => this.data.data.choices[val]);
        }
    }

    getAnswer() : number[] {
        return this.userChoices.map(val => this.data.data.choices.indexOf(val));
    }

    mark(attempt: ComponentAttempt, prev: ComponentAttempt) : ComponentAttempt {
        // If the question is answered in review phase, add 2 to the mark and not 5.
        let markIncrement = prev ? 2 : 5;
        attempt.correct = true;
        attempt.marks = 0;
        attempt.maxMarks = 0;
        // For every item in the answer...
        attempt.answer.forEach((answer, index, array) => {
            // except the first one...
            if (index != 0) {
                // increase the maximum marks by 5,
                attempt.maxMarks += 5;
                // and if this item and the one before it are in the right order and are adjacent...
                if(answer - array[index-1] == 1) {
                    // and the program is in the live phase...
                    if(!prev) {
                        // increase the marks by 5.
                        attempt.marks += markIncrement;
                    }
                    // or the item wasn't correct in the live phase...
                    else if(prev.answer[index] - prev.answer[index-1] != 1) {
                        // increase the marks by 2.
                        attempt.marks += markIncrement;
                    }
                }
                // if not..
                else {
                    // the answer is not correct.
                    attempt.correct = false;
                }
            }
        })
        // Then, if the attempt scored no marks and the program is in live phase, then give the student a mark.
        if(attempt.marks == 0 && !prev) attempt.marks = 1;
        return attempt;
    }
}
