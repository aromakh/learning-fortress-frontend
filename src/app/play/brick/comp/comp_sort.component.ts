import { Component, Input } from '@angular/core';

import { Comp, ComponentAttempt } from '../../../schema';
import { register } from './comp_index';
import { CompComponent } from "./comp.component";
import { MAT_CHECKBOX_CLICK_ACTION } from '@angular/material/checkbox';

export class CompSort extends Comp {
    name = "Sort";
    data: { choices:{ [choice: string]: number }, reveals: { [choice: string]: string }, categories: string[] }

    constructor(data: { choices:{ [choice: string]: number }, reveals: { [choice: string]: string }, categories: string[] }) {
        super();
        this.data = data;
    }
}

@register("Sort")
@Component({
    selector: 'sort',
    template: `
    <!-- 50px margin at bottom to push reveals out from under the category columns -->
    <div class="sort-container" fxLayout="column" fxLayoutAlign="start stretch" fxLayoutGap="10px">
        <div class="cat-container" *ngFor="let cat of userCats; let i = index" fittext>
            <div class="cat-header">{{cat.name}}</div>
            <mat-list [dragula]="'DRAG'" [(dragulaModel)]="cat.choices" class="sort-list">
                <mat-list-item  class="touch-list-item sort-list-item not-selectable-posterity" *ngFor="let item of cat.choices">
                    <ng-container *ngIf="attempt; else dragndrop">
                        <span class="tick-icon tick-FilledDenimBlueRectTick" *ngIf="getState(item) == 1; else crossElement">
                            <span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span>
                        </span>
                        <ng-template #crossElement>
                           <span class="tick-icon tick-FilledDenimBlueRectCross">
                               <span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span><span class="path6"></span>
                           </span>
                        </ng-template>
                    </ng-container>
                    <ng-template #dragndrop>
                        <mat-icon class="material-icons" style="vertical-align:middle;">drag_indicator</mat-icon>
                    </ng-template>
                    <div [innerHTML]="item" style="margin-right:2px;"></div>
                    <div *ngIf="attempt && data.data.reveals[item]" class="reveal rounded" [innerHTML]="data.data.reveals[item]"></div>
                </mat-list-item>
            </mat-list>
        </div>
    </div>
    `,
    styleUrls: ['./comp_sort.component.scss', '../live.component.scss'],
    providers: [
        {provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'noop'}
    ]
})
export class SortComponent extends CompComponent {
    @Input() data: CompSort;

    userCats: {choices: string[], name: string}[];

    ngOnInit() {
        if(!this.attempt) {
            var choicesArray = Object.keys(this.data.data.choices).map(key => key);
            this.userCats = [];
            this.data.data.categories.forEach(cat => { this.userCats.push({ choices: [], name: cat }) });
            this.userCats.push({ choices: choicesArray, name: "Unsorted" });
        } else {
            this.userCats = [];
            this.data.data.categories.forEach(cat => { this.userCats.push({ choices: [], name: cat }) });
            this.userCats.push({ choices: [], name: "Unsorted" });
            Object.keys(this.attempt.answer).forEach((val) => {
                this.userCats[this.attempt.answer[val]].choices.push(val);
            });
            this.userCats[0].choices = Object.keys(this.data.data.choices).filter(val => {
                return this.attempt.answer[val] == undefined;
            });
        }
    }

    getAnswer() : { [choice: string]: number } {
        var choices = {};
        this.userCats.forEach((cat, index) => {
            cat.choices.forEach((choice) => {
                choices[choice] = index;
            })
        })
        return choices;
    }

    getState(choice) {
        if(this.attempt.answer[choice] == this.data.data.choices[choice]) {
            return 1;
        } else {
            return -1;
        }
    }

    mark(attempt: ComponentAttempt, prev: ComponentAttempt) : ComponentAttempt {
        // If the question is answered in review phase, add 2 to the mark and not 5.
        let markIncrement = prev ? 2 : 5;
        attempt.correct = true;
        attempt.marks = 0;
        attempt.maxMarks = 0;
        // For every item...
        Object.keys(this.data.data.choices).forEach((key, index) => {
            // increase the maximum marks by 5,
            attempt.maxMarks += 5;
            // and if the user's answer and the correct answer are in different categories...
            if(attempt.answer[key] != this.data.data.choices[key]) {
                // the answer is not correct.
                attempt.correct = false;
            }
            // if not...
            else {
                // and the program is in the live phase...
                if(!prev) {
                    // Increase the marks by 5.
                    attempt.marks += markIncrement;
                }
                // or the previous answer was not correct already...
                else if(prev.answer[key] != this.data.data.choices[key]) {
                    // Increase the marks by 2.
                    attempt.marks += markIncrement;
                }
            }
        });
        // Then, if the attempt scored no marks, and there are some answers given, and the program is in live phase, then give the student a mark.
        if(attempt.marks == 0 && Object.keys(attempt.answer).length != 0 && !prev) attempt.marks = 1;
        return attempt;
    }
}
