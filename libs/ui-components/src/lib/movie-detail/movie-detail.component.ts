import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '@movie-monorepo/movie-api';
import { RouterModule } from '@angular/router';
import { Movie } from '@movie-monorepo/movie-api/src/lib/models';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'lib-ui-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss']
})
export class MovieDetailComponent implements OnInit {
  movie: Movie | null = null;
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.movieService.getMovieDetails(id).pipe(
        catchError(error => {
          console.error('Error fetching movie details', error);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(response => {
        this.movie = response;
      });
    }
  }

  getGenreTitles(genres: ReadonlyArray<{ title: string | null }>): string {
    return genres.map(genre => genre.title).join(', ');
  }

  goBack(): void {
    this.location.back();
  }
}
