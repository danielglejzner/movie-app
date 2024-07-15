export type DataWithPaginationResponse<T> = {
    readonly data: Array<T>;
    readonly totalPages: number;
  };
  
  export type GenreResponse = {
    readonly id: string;
    readonly title: string | null;
    readonly totalMovies: number;
  };
    
  export type Genre = {
    readonly id: string;
    readonly title: string | null;
    readonly movies: Array<Partial<Movie>>;
  };
  
  export type Movie = {
    readonly id: string;
    readonly title: string;
    readonly posterUrl: string;
    readonly summary: string;
    readonly duration: string;
    readonly directors: readonly string[];
    readonly mainActors: readonly string[];
    readonly genres: readonly Omit<Genre, 'movies'>[];
    readonly datePublished: string;
    readonly rating: string;
    readonly ratingValue: number;
    readonly bestRating: number;
    readonly worstRating: number;
    readonly writers: readonly string[];
  };
  
  export type MovieSummary = Pick<Movie, 'id' | 'title' | 'posterUrl' | 'rating'>;
  

  