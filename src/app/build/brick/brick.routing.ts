import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BrickComponent } from './brick.component';
import { IntroductionComponent } from './introduction.component';
import { LiveComponent } from './live.component';
import { SummaryComponent } from './summary.component';
import { ReviewComponent } from './review.component';
import { EndingComponent } from './ending.component';
import { ProvisionalScoreComponent } from './provisional_score.component';

const brickRoutes = [
    {path: ':id', component: BrickComponent, children: [
        { path: 'intro', component: IntroductionComponent },
        { path: 'live', component: LiveComponent },
        { path: 'provisionScore', component: ProvisionalScoreComponent },
        { path: 'summary', component: SummaryComponent },
        { path: 'review', component: ReviewComponent },
        { path: 'ending', component: EndingComponent },
        { path: '', redirectTo: 'intro', pathMatch: 'full' }
    ]}
]

@NgModule({
    imports: [ RouterModule.forChild(brickRoutes) ],
    exports: [ RouterModule ]
})
export class BrickRoutingModule { }
