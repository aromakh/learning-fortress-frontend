import { Component, Input, Directive } from '@angular/core';

import { Comp, ComponentAttempt } from '../../../schema';
import { register } from './comp_index';
import { CompComponent } from './comp.component';

interface DropDown {
    
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
    <p *ngIf="attempt" fittext style="background: yellow">{{ data.data.reveal }}</p>
    <p class="text-highlighting">
        <ng-container *ngFor="let word of words; let i = index">
            <span> {{ word.word }} </span>

            <!-- Dropdowns -->
            <ng-container *ngFor="let dropdown of data.data.dropdowns; let dropdownNum = index">
                <ng-container *ngIf="dropdown.afterWord === i">
                    <span class="selectWrapper">
                        <ng-container *ngIf="attempt">
                            <mat-checkbox
                                [indeterminate]="answerChoices[dropdownNum].value == !dropdown.correctChoiceNum"
                                [checked]="answerChoices[dropdownNum].value == dropdown.correctChoiceNum" disabled>
                                </mat-checkbox>
                        </ng-container>
                        <mat-form-field>
                            <mat-select [placeholder]="dropdown.text" [(ngModel)]="answerChoices[dropdownNum].value">
                                <mat-option
                                    *ngFor="let choice of data.data.choices; let i = index"
                                    [value]="i">
                                    {{choice}}
                                </mat-option>
                            </mat-select>
                        </mat-form-field>
                    </span>
                </ng-container>
            </ng-container>

        </ng-container>
    </p>
    `,
    styles: [`
        .selectWrapper {
            padding-left: 10px;
            padding-right: 10px;
        }

        .mat-form-field {
            height: 43px;
        }
    `],
})
export class TextDropdownsComponent extends CompComponent {
    _data: CompTextDropdowns;

    get data() { return this._data; }
    @Input()
    set data(data: CompTextDropdowns) {
      this._data = data;
      data.data.dropdowns.forEach(dropdown => this.answerChoices.push({value: -1}));
    }

    words: { word: string }[];
    answerChoices: any[] = [];

    ngOnInit() {
        this.words = this.data.data.text.split(' ').map((word) => ({ word: word }));
        if (this.attempt) {
            this.answerChoices = this.attempt.answer;
        }
    }

    mark(attempt: ComponentAttempt, prev: ComponentAttempt): ComponentAttempt {
        // If the question is answered in review phase, add 2 to the mark and not 5.
        const markValue = this.data.data.markPerAnswer ? this.data.data.markPerAnswer : 5;
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
