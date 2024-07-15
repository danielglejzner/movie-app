import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { tap, switchMap, catchError, debounceTime } from 'rxjs/operators';
import { Movie, MovieSummary, DataWithPaginationResponse, GenreResponse } from '../../models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly baseUrl = 'https://0kadddxyh3.execute-api.us-east-1.amazonaws.com';
  private token: string | null = null;
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  
  private readonly state = {
    $movies: signal<MovieSummary[]>([]),
    $genres: signal<GenreResponse[]>([]),
    $loadingMovies: signal<boolean>(false),
    $loadingGenres: signal<boolean>(false),
    $totalResults: signal<number>(0),
    $currentPage: signal<number>(1),
    $searchTerm: signal<string>(''),
    $selectedGenre: signal<string>(''),
  } as const;

  public readonly $movies = this.state.$movies.asReadonly();
  public readonly $genres = this.state.$genres.asReadonly();
  public readonly $loadingMovies = this.state.$loadingMovies.asReadonly();
  public readonly $loadingGenres = this.state.$loadingGenres.asReadonly();
  public readonly $totalResults = this.state.$totalResults.asReadonly();
  public readonly $currentPage = this.state.$currentPage.asReadonly();
  public readonly $searchTerm = this.state.$searchTerm.asReadonly();
  public readonly $selectedGenre = this.state.$selectedGenre.asReadonly();

  private readonly searchTerms = new Subject<string>();

  constructor() {
    this.initialize();
    this.setupSearchTermListener();
  }

  private get authHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
  }

  private fetchToken(): Observable<void> {
    return this.http.get<{ token: string }>(`${this.baseUrl}/auth/token`).pipe(
      tap(response => {
        this.token = response.token;
      }),
      switchMap(() => of(undefined))
    );
  }

  private initialize(): void {
    this.fetchToken().pipe(
      switchMap(() => this.fetchGenres()),
      switchMap(() => this.searchMovies()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private setupSearchTermListener(): void {
    this.searchTerms.pipe(
      debounceTime(300),
      tap(term => this.state.$searchTerm.set(term)),
      switchMap(() => this.searchMovies()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private setParams(): HttpParams {
    return new HttpParams()
      .set('page', this.state.$currentPage())
      .set('limit', 25)
      .set('search', this.state.$searchTerm())
      .set('genre', this.state.$selectedGenre() ? this.state.$selectedGenre() : '');
  }

  fetchGenres(): Observable<void> {
    this.state.$loadingGenres.set(true);
    return this.http.get<DataWithPaginationResponse<GenreResponse>>(`${this.baseUrl}/genres/movies`, { headers: this.authHeaders }).pipe(
      tap(response => this.state.$genres.set(response.data)),
      catchError(() => of([])),
      tap(() => this.state.$loadingGenres.set(false)),
      switchMap(() => of(undefined))
    );
  }

  searchMovies(): Observable<void> {
    this.state.$loadingMovies.set(true);
    const params = this.setParams();
    
    return this.http.get<DataWithPaginationResponse<MovieSummary>>(`${this.baseUrl}/movies`, { params, headers: this.authHeaders }).pipe(
      tap(response => {
        this.state.$movies.set(response.data);
        this.state.$totalResults.set(response.data?.length);
      }),
      catchError(() => of([])),
      tap(() => this.state.$loadingMovies.set(false)),
      switchMap(() => of(undefined))
    );
  }

  getMovieDetails(id: string): Observable<Movie> {
    const params = new HttpParams().set('id', id);
    return this.http.get<Movie>(`${this.baseUrl}/movies/${id}`, { params, headers: this.authHeaders });
  }

  setSearchTerm(term: string): void {
    this.searchTerms.next(term);
  }

  setSelectedGenre(genre: string): void {
    this.state.$selectedGenre.set(genre);
    this.searchMovies().pipe(takeUntilDestroyed(this.destroyRef)
  ).subscribe();
  }

  nextPage(): void {
    if (this.state.$currentPage() < this.state.$totalResults()) {
      this.state.$currentPage.update(page => page + 1);
      this.searchMovies().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }

  previousPage(): void {
    if (this.state.$currentPage() > 1) {
      this.state.$currentPage.update(page => page - 1);
      this.searchMovies().pipe(takeUntilDestroyed(this.destroyRef)).subscribe()
    }
  }
}
