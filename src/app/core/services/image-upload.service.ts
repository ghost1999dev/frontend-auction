import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {

  constructor(private http: HttpClient) { }

  uploadUserImage(userId: number, imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', imageFile); // 'image' debe coincidir con el nombre esperado por multer

    return this.http.put(`${environment.server_url}users/upload-image/${userId}`, formData);
  }

  getImageUrl(imagePath: string): string {
    return imagePath 
    ? `${environment.server_url}${imagePath}` 
    : 'assets/images/default-user.png'; // Imagen por defecto
  }

  uploadAttachments(formData: FormData): Observable<{ids: number[]}> {
    return this.http.post<{ids: number[]}>(`${environment.server_url}/attachments`, formData);
  }
}