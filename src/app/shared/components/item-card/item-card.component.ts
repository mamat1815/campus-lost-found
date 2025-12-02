import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ItemResponse } from '../../../core/models/item.model';
import { ImageUrlPipe } from '../../pipes/image-url-pipe';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule, RouterModule, ImageUrlPipe],
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.scss']
})
export class ItemCardComponent {
  @Input() item!: ItemResponse;

  getStatusColor(status: string): string {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'CLAIMED': return 'bg-orange-100 text-orange-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
