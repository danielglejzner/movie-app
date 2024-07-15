import { Routes } from '@angular/router';
import { MovieSearchComponent} from '@movie-monorepo/ui-components';
import { MovieDetailComponent } from '@movie-monorepo/ui-components';

export const appRoutes: Routes = [
  { path: '', component: MovieSearchComponent },
  { path: 'movie/:id', component: MovieDetailComponent }
];