import { Comp, ComponentAttempt } from '../../../schema';
import { Component, Input } from '@angular/core';

import {MatButtonToggleChange} from '@angular/material/button-toggle';
import { MAT_CHECKBOX_CLICK_ACTION } from '@angular/material/checkbox';

import { register } from './comp_index';
import { CompComponent } from './comp.component';

export class CompMultipleChoice extends Comp {
    name = 'Multiple Choice';
    data: { choices: string[], reveals: string[], correctAnswers: number };

    constructor(data: { choices: string[], reveals: string[], correctAnswers: number }) {
        super();
        this.data = data;
    }
}

@register('MultipleChoice')
@Component({
    selector: 'multiple-choice',
    template: `
    <mat-button-toggle-group name="choice" class="choice" fxLayout="column" fxLayoutGap="0px" fxLayoutAlign="center center" multiple>
        <mat-button-toggle
            ngDefaultControl
            [checked]="answers[getChoice(choice)]"
            (change)="changeAnswer($event, i)"
            name="choice-{{i}}"
            class="flex-choice"
            fxLayout="column"
            fxLayoutAlign="stretch stretch"
            *ngFor="let choice of data.data.choices | shuffle; let i = index"
            [value]="choice">

            <div fxLayout="row" fxLayoutAlign="space-around center">
                <ng-container *ngIf="attempt">
                    <span class="tick-icon tick-FilledDenimBlueRectTick" *ngIf="getState(choice) == 1">
                        <span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span>
                    </span>
                    <span class="tick-icon tick-FilledDenimBlueRectCross" *ngIf="getState(choice) == -1">
                        <span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span><span class="path6"></span>
                    </span>
                    <mat-checkbox *ngIf="getState(choice) == 0" disabled></mat-checkbox>
                </ng-container>
                <div fxFlex="1 0 0"></div>
                <div fxLayout="column">
                    <div fittext [minFontSize]="15">{{ choice }}</div>
                    <div *ngIf="attempt" class="reveal" fittext [minFontSize]="15">{{ data.data.reveals[getChoice(choice)] }}</div>
                </div>
                <div fxFlex="1 0 0"></div>
            </div>
        </mat-button-toggle>
    </mat-button-toggle-group>
    `,
    styleUrls: ['../live.component.scss'],
    providers: [
        {provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'noop'}
    ]
})
export class MultipleChoiceComponent extends CompComponent {
    constructor() { super(); }

    ngOnInit() {
        // Set all the choices as false initially
        this.answers = this.data.data.choices.map(() => false);
        if (this.attempt) {
            this.attempt.answer
                // Filter to see if more choices have been made than correctAnswers
                .filter(val => val < this.data.data.correctAnswers)
                .forEach(val => { this.answers[val] = true; });
        }
    }

    @Input() data: CompMultipleChoice;
    answers: boolean[];

    changeAnswer(event: MatButtonToggleChange, index: number): void {
        this.answers[this.getChoice(event.value)] = event.source.checked ? true : false;
    }

    getAnswer(): number[] {
        const a = [];
        // For each choice if true push to a (correct answer array)
        this.answers.forEach((answer, index) => {
            if (answer) { a.push(index); }
        });
        return a;
    }

    getChoice(choice): number {
        return this.data.data.choices.indexOf(choice);
    }

    getState(choice): number {
        if (this.attempt.answer.indexOf(this.getChoice(choice)) !== -1) {
            if (this.getChoice(choice) < this.data.data.correctAnswers) {
                return 1;
            } else {
                return -1;
            }
        } else {
            return 0;
        }
    }

    markLiveChoices(attempt, markIncrement) {
        this.data.data.choices.forEach((ans, i) => {
            if (i <= this.data.data.correctAnswers - 1) {
                if (attempt.answer.indexOf(i) === -1) {
                    attempt.correct = false;
                } else {
                    attempt.marks += markIncrement;
                }
            } else {
                if (attempt.answer.indexOf(i) !== -1) {
                    attempt.marks -= markIncrement;
                    attempt.correct = false;
                }
            }
        });
    }

    mark(attempt: ComponentAttempt, prev: ComponentAttempt): ComponentAttempt {
        // If this is live then increment by 5, if review then increment by 2
        const markIncrement = prev ? 2 : 5;
        attempt.correct = true;
        attempt.marks = 0;

        attempt.maxMarks = this.data.data.correctAnswers * markIncrement;
        this.markLiveChoices(attempt, markIncrement);

        // Then, if the attempt scored no marks or negative and the program is in live phase, then give the student a mark.
        if (attempt.marks <= 0 && attempt.answer !== [] && !prev) { attempt.marks = 1; }
        
        // If in the review phase and the mark has ended up as -1 then reset to 0 additional marks
        if (attempt.marks <= 0) {attempt.marks = 0; }
        return attempt;
    }

    public trackByIndex(index: number, item) {
        return index;
    }
}
