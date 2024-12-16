import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/env/environment';
import { Observable } from 'rxjs';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Story } from './model/story.model';
import { Book } from './model/book.model';



@Injectable({
  providedIn: 'root'
})
export class StoryService {

  constructor(private http: HttpClient) { }

 
  addStory(story : Story): Observable<Story>{
    return this.http.post<Story>(environment.apiHost +'author/story', story)
  }

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(environment.apiHost + 'tourist/storiesUnlocked/all')
  }

}
