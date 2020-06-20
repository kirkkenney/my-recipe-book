import { TrimPipe } from './trim.pipe';
import { NgModule } from "@angular/core";
import { StringcutPipe } from './stringcut.pipe';


@NgModule({
    declarations: [
        StringcutPipe,
        TrimPipe
    ],
    imports: [
    ],
    exports: [
        StringcutPipe,
        TrimPipe
    ]
})

export class SharedModule {}