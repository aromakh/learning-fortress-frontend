import { Component, Input } from '@angular/core';

import { Comp, ComponentAttempt } from '../../../schema';
import { register } from './comp_index';
import { CompComponent } from "./comp.component";
import { MAT_CHECKBOX_CLICK_ACTION } from '@angular/material/checkbox';

export class CompShortAnswer extends Comp {
    name = "Short Answer";
    data: { text: string, entries: { name: string, answer: string }[], reveal: string };

    constructor(data: { text: string, entries: { name: string, answer: string }[], reveal: string }) {
        super();
        this.data = data;
    }
}

@register("ShortAnswer")
@Component({
    selector: 'short-answer',
    template: `
    <p>{{data.data.text}}</p>
    <div class="short-answer-container" fxLayout.gt-xs="row wrap" fxLayoutAlign.gt-xs="space-evenly center" fxLayout.xs="column">
        <div *ngFor="let entry of data.data.entries; let i = index" fxFlex="0 0 33%">
            <ng-container *ngIf="attempt">
                <span class="tick-icon tick-FilledDenimBlueRectTick" *ngIf="getState(i) == 1">
                    <span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span>
                </span>
                <span class="tick-icon tick-FilledDenimBlueRectCross" *ngIf="getState(i) == -1">
                    <span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span><span class="path6"></span>
                </span>
                <mat-checkbox *ngIf="getState(i) == 0" disabled></mat-checkbox>
            </ng-container>
            <mat-form-field>
                <input matInput placeholder="{{entry.name}}" [(ngModel)]="userAnswers[i]" />
            </mat-form-field>
            <div *ngIf="attempt && data.data.reveal && getState(i) != 1"
                 class="reveal" fittext [minFontSize]="15"
                 [innerHTML]="data.data.reveal"></div>
        </div>
    </div>
    `,
    styleUrls: ['../live.component.scss'],
    providers: [
        {provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'noop'}
    ]
})
export class ShortAnswerComponent extends CompComponent {
    @Input() data: CompShortAnswer;

    userAnswers: string[];

    ngOnInit() {
        this.userAnswers = [];
        if(this.attempt) {
            this.userAnswers = this.attempt.answer.slice();
        }
    }

    getAnswer() : string[]{
        return this.userAnswers;
    }

    getState(entry: number) : number {
        if(this.attempt.answer[entry]) {
            if(this.attempt.answer[entry].toLowerCase().replace(/ /g,'') == this.data.data.entries[entry].answer.toLowerCase().replace(/ /g,'')) {
                return 1;
            } else { return -1; }
        } else { return 0; }
    }

    mark(attempt: ComponentAttempt, prev: ComponentAttempt) : ComponentAttempt {
        // If the question is answered in review phase, add 2 to the mark and not 5.
        let markIncrement = prev ? 2 : 5;
        attempt.correct = true;
        attempt.marks = 0;
        // The maximum number of marks is the number of entries * 5.
        attempt.maxMarks = this.data.data.entries.length * 5;
        // For every entry...
        this.data.data.entries.forEach((entry: {name: string, answer: string}, index) => {
            // if there is an answer given...
            if(this.userAnswers[index]) {
                // and the answer is equal to the answer in the database (lowercase and whitespace stripped)
                if(this.userAnswers[index].toLowerCase().replace(/ /g,'') == entry.answer.toLowerCase().replace(/ /g,'')) {
                    // and the program is in the live phase...
                    if(!prev) {
                        // increase the marks by 5.
                        attempt.marks += markIncrement;
                    }
                    // or the answer was already correct before the review...
                    else if (prev.answer[index].toLowerCase().replace(/ /g,'') != entry.answer.toLowerCase().replace(/ /g,'')) {
                        // increase the marks by 2.
                        attempt.marks += markIncrement;
                    }
                }
                // if not...
                else {
                    // the answer is not correct.
                    attempt.correct = false;
                }
            }
            // if not...
            else {
                // the answer is not correct.
                attempt.correct = false;
            }
        })
        // Then, if there are no marks, and there are no empty entries, and the program is in live phase, give the student a mark.
        if(attempt.marks == 0 && this.userAnswers.indexOf("") == -1 && !prev) attempt.marks = 1;
        return attempt;
    }
}
