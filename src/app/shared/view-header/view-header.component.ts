import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/core/services/layout.service';

@Component({
  selector: 'app-view-header',
  templateUrl: './view-header.component.html',
  styleUrls: ['./view-header.component.scss']
})
export class ViewHeaderComponent {

  constructor(public layoutService: LayoutService, public router: Router) { }

}
