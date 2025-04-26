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
    formData.append('image', imageFile); // 'image' debe coincidir con el nombre esperado por multer

    return this.http.patch(`${environment.server_url}users/update-fields/${userId}`, formData);
  }

  getImageUrl(imagePath: string): string {
    return imagePath 
    ? `${environment.server_url}${imagePath}` 
    : 'assets/images/default-user.png'; // Imagen por defecto
  }
}