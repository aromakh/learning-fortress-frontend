import { Component, Input, Directive } from '@angular/core';

import { Comp, ComponentAttempt } from '../../../schema';
import { register } from './comp_index';
import { CompComponent } from './comp.component';

interface DropDown {
    afterWord: number;
    correctChoiceNum: number;
    reveal: string;
    isTouched?: boolean;
}

export class CompTextDropdowns extends Comp {
    name = 'Text Dropdowns';
    data: { text: string, dropdowns: any[], choices: string[], markPerAnswer: number, reveal: string };

    constructor(data: { text: string, dropdowns: DropDown[], choices: string[], markPerAnswer: number, reveal: string }) {
        super();
        this.data = data;
    }
}

@register('TextDropdowns')
@Component({
    selector: 'text-dropdowns',
    template: `
    <div *ngIf="attempt && data.data.reveal" class="reveal" [innerHTML]="data.data.reveal" ></div>
    <div class="comp-dropdown-container">
        <ng-container *ngFor="let word of words; let i = index;">
            <span  [innerHTML]="' '+word.word+' '"></span>

            <!-- Dropdown -->
            <ng-container *ngFor="let dropdown of data.data.dropdowns; let dropdownNum = index">
                <ng-container *ngIf="dropdown.afterWord === i">
                    <span class="dropdown-wrapper">
                        <ng-container *ngIf="attempt">
                            <span class="tick-icon tick-FilledDenimBlueRectCross" *ngIf="!isCorrect(dropdownNum, dropdown); else tickElement">
                                <span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span><span class="path6"></span>
                            </span>
                            <ng-template #tickElement>
                                <span class="tick-icon tick-FilledDenimBlueRectTick">
                                    <span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span>
                                </span>
                            </ng-template>
                        </ng-container>
                        <mat-form-field [ngClass]="{'dropdown-size': !attempt}" (click)="hideAnswer(dropdown)">
                            <mat-select [placeholder]="dropdown.text" [(ngModel)]="answerChoices[dropdownNum].value">
                                <mat-option *ngFor="let choice of data.data.choices; let i = index" [value]="i">
                                    {{choice}}
                                </mat-option>
                            </mat-select>
                            <mat-hint *ngIf="attempt && !isCorrect(dropdownNum, dropdown) && dropdown.reveal" class="reveal" [innerHTML]="dropdown.reveal"></mat-hint>
                        </mat-form-field>
                    </span>
                </ng-container>
            </ng-container>

        </ng-container>
    </div>
    `,
    styleUrls: ["../live.component.scss"],
})
export class TextDropdownsComponent extends CompComponent {
    words: { word: string }[];
    answerChoices: any[] = [];
    _data: CompTextDropdowns;

    get data() { return this._data; }
    @Input()
    set data(data: CompTextDropdowns) {
      this._data = data;
      data.data.dropdowns.forEach(dropdown => this.answerChoices.push({value: -1}));
    }

    isCorrect(dropdownNum, dropdown) {
       return !dropdown.isTouched && this.answerChoices[dropdownNum].value === dropdown.correctChoiceNum;
    }

    notCorrect(dropdownNum, dropdown) {
        return !dropdown.isTouched && !this.isCorrect(dropdownNum, dropdown) && this.answerChoices[dropdownNum].value > -1;
    }

    // on review not showing correct answer
    hideAnswer(dropdown: DropDown) {
        if (this.attempt) {
            dropdown.isTouched = true;
        }
    }

    ngOnInit() {
        this.words = this.data.data.text.split(' ').map((word) => ({ word: word }));
        if (this.attempt) {
            this.answerChoices = [];
            this.answerChoices = this.attempt.answer;
        }
    }

    mark(attempt: ComponentAttempt, prev: ComponentAttempt): ComponentAttempt {
        // If the question is answered in review phase, add 2 to the mark and not 5.
        const markValue = 5;
        const markIncrement = prev ? 2 : markValue;

        attempt.correct = true;
        attempt.marks = 0;
        attempt.maxMarks = this.data.data.dropdowns.length * 5;

        // !!! answerChoice have same index as dropdown so only one loop !!!
        const {dropdowns} = this.data.data;
        this.answerChoices.forEach((choice, i) => {
            if (choice.value === dropdowns[i].correctChoiceNum) {
                attempt.marks += markIncrement;
            } else {
                attempt.correct = false;
            }
        });

        attempt.answer = this.answerChoices;

        if (attempt.marks === 0 && attempt.answer !== [] && !prev) { attempt.marks = 1; }
        return attempt;
    }
}
