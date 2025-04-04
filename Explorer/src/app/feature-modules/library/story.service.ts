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

 
  addStory(story : Story, keyId : number): Observable<Story>{
    return this.http.post<Story>(environment.apiHost +'author/story', story, {
      params: {
        keyId: keyId.toString()
      }
    });
  }
  addBook(book : Book): Observable<Book>{
    return this.http.post<Book>(environment.apiHost +'admin/books/createBook', book)
  }

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(environment.apiHost + 'tourist/storiesUnlocked/all')
  }

  getStoriesInBook(id:number): Observable<PagedResults<Story>> {
    return this.http.get<PagedResults<Story>>(environment.apiHost + 'tourist/storiesUnlocked/allInBook', {
      params: {
        bookId: id.toString()
      }
    });
  }

  getBookById(id:number):Observable<Book>{
    return this.http.get<Book>(environment.apiHost + 'tourist/books/byId', {
      params: {
        bookId: id.toString()
      }
    });
  }
  getUser(userId: number): Observable<string> {
    const params = { userId: userId.toString() };
  
    return this.http.get<string>(`${environment.apiHost}user/tourist/getUsername`, { params, responseType: 'text' as 'json' });
  }
  getUserForAdmin(userId: number): Observable<string> {
    const params = { userId: userId.toString() };
  
    return this.http.get<string>(`${environment.apiHost}administrator/users/getUsername`, { params, responseType: 'text' as 'json' });
  }
  getStoryById(id:number):Observable<Story>{
    return this.http.get<Story>(environment.apiHost + 'administrator/stories/byId', {
      params: {
        id: id.toString()
      }
    });
  }

  updateStory(story : Story): Observable<Story>{
    return this.http.put<Story>(`${environment.apiHost}administrator/stories/${story.id}`, story)
  }

  getBooksForAuthor(): Observable<Book[]> {
    return this.http.get<Book[]>(environment.apiHost + 'admin/books/forAdmin')
  }


  

  
}
