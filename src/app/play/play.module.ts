import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../material.module';

// Components
import { DashboardComponent } from './dashboard/dashboard.component';
import { PlayComponent } from './play.component';
import { PalletComponent } from './pallet/pallet.component';
import { BrickModule } from './brick/brick.module';
import { NavigationModule } from '../navigation/navigation.module';

// Routing
import { PlayRoutingModule } from './play.routing';
import { IntroService } from '../intro.service';

@NgModule({
    imports: [ PlayRoutingModule, CommonModule, FlexLayoutModule, MaterialModule, BrickModule, NavigationModule ],
    declarations: [ PlayComponent, DashboardComponent, PalletComponent ],
    exports: [ NavigationModule ],
    providers: [IntroService]
})
export class PlayModule { }