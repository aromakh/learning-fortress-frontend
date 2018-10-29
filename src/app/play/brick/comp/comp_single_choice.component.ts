import { Comp, ComponentAttempt } from "../../../schema";
import { Component, Input } from "@angular/core";

import { register } from './comp_index';
import { CompComponent } from "./comp.component";
import { MAT_CHECKBOX_CLICK_ACTION } from "@angular/material/checkbox";

export class CompSingleChoice extends Comp {
    name = "Single Choice";
    data: { choices:string[], reveals:string[] }

    constructor(data: { choices:string[], reveals:string[] }) {
        super();
        this.data = data;
    }
}

@register("SingleChoice")
@Component({
    selector: "single-choice",
    template: `
    <mat-button-toggle-group [(ngModel)]="answer" name="choice" class="choice" fxLayout="column" fxLayoutGap="0px" fxLayoutAlign="center center">
        <mat-button-toggle class="flex-choice" *ngFor="let choice of data.data.choices | shuffle; let i = index" value="{{ choice }}" fxLayout="column" fxLayoutAlign="stretch stretch">
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
                    <div fittext [minFontSize]="15" [innerHTML]="choice"></div>
                    <div *ngIf="attempt && data.data.reveals[getChoice(choice)]"
                         class="reveal" fittext [minFontSize]="15"
                         [innerHTML]="data.data.reveals[getChoice(choice)]">
                    </div>
                </div>
                <div fxFlex="1 0 0"></div>
            </div>
        </mat-button-toggle>
    </mat-button-toggle-group>
    `,
    styleUrls: ["../live.component.scss"],
    providers: [
        {provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'noop'}
    ]
})
export class SingleChoiceComponent extends CompComponent {
    constructor() { super() }

    @Input() data: CompSingleChoice;
    answer: string;

    ngOnInit() {
        if(this.attempt) {
            this.answer = this.data.data.choices[this.attempt.answer];
        }
    }

    getAnswer() : number {
        return this.data.data.choices.indexOf(this.answer);
    }

    getChoice(choice) : number {
        return this.data.data.choices.indexOf(choice);
    }

    getState(choice) : number {
        if(this.getChoice(choice) == this.attempt.answer) {
            if(this.getChoice(choice) == 0) {
                return 1;
            } else {
                return -1;
            }
        } else {
            return 0;
        }
    }

    mark(attempt: ComponentAttempt, prev: ComponentAttempt) : ComponentAttempt {
        // If the question is answered in review phase, add 2 to the mark and not 5.
        let markIncrement = prev ? 2 : 5;
        // set attempt.correct to true if the answer is 0.
        attempt.correct = (attempt.answer == 0);
        attempt.maxMarks = 5;
        // if the attempt is correct, add the mark increment.
        if(attempt.correct) attempt.marks = markIncrement;
        // if there is an answer given and the program is in the live phase, give the student an extra mark.
        else if (attempt.answer != null && !prev) attempt.marks = 1;
        else attempt.marks = 0;
        return attempt;
    }
}
