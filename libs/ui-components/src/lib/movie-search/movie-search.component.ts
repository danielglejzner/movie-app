import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '@movie-monorepo/movie-api';
import { RouterModule } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'lib-ui-movie-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './movie-search.component.html',
  styleUrls: ['./movie-search.component.scss']
})
export class MovieSearchComponent implements OnInit {
  searchTerm = '';
  selectedGenre = '';

  movieService = inject(MovieService);
  private destroyRef = inject(DestroyRef);
 

  ngOnInit(): void {
    this.movieService.fetchGenres().pipe(
      switchMap(() => this.movieService.searchMovies()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  searchMovies(): void {
    this.movieService.setSearchTerm(this.searchTerm);
    this.movieService.setSelectedGenre(this.selectedGenre);
  }

  setGenre(genre: string): void {
    this.selectedGenre = genre;
    this.movieService.setSelectedGenre(genre);
  }

  nextPage(): void {
    this.movieService.nextPage();
  }

  previousPage(): void {
    this.movieService.previousPage();
  }
}
