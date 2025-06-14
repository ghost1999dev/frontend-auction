import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/core/services/layout.service';

@Component({
  selector: 'app-view-footer',
  templateUrl: './view-footer.component.html',
  styleUrls: ['./view-footer.component.scss']
})
export class ViewFooterComponent {

   constructor(public layoutService: LayoutService, public router: Router) { }
 
}
