import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ItemResponse, ItemCategory } from '../../../core/models/item.model';
import { ItemCardComponent } from '../../../shared/components/item-card/item-card.component';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
    selector: 'app-item-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, ItemCardComponent],
    templateUrl: './item-list.component.html',
    styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit {
    activeTab: 'LOST' | 'FOUND' = 'LOST';
    items: ItemResponse[] = [];
    filteredItems: ItemResponse[] = [];
    categories: ItemCategory[] = [];
    isLoading = false;

    // Filters
    searchQuery = '';
    selectedCategory = '';
    selectedStatus = '';

    private searchSubject = new Subject<string>();

    constructor(private apiService: ApiService) {
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(() => {
            this.applyFilters();
        });
    }

    ngOnInit(): void {
        this.loadCategories();
        this.loadItems();
    }

    loadCategories(): void {
        this.apiService.getCategories().subscribe(categories => {
            this.categories = categories;
        });
    }

    loadItems(): void {
        this.isLoading = true;
        this.apiService.getItems({ type: this.activeTab }).subscribe({
            next: (items) => {
                this.items = items;
                this.applyFilters();
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    switchTab(tab: 'LOST' | 'FOUND'): void {
        if (this.activeTab !== tab) {
            this.activeTab = tab;
            this.loadItems();
        }
    }

    onSearch(query: string): void {
        this.searchQuery = query;
        this.searchSubject.next(query);
    }

    onFilterChange(): void {
        this.applyFilters();
    }

    applyFilters(): void {
        this.filteredItems = this.items.filter(item => {
            const matchesSearch = !this.searchQuery ||
                item.title.toLowerCase().includes(this.searchQuery.toLowerCase());

            const matchesCategory = !this.selectedCategory ||
                item.category_id === this.selectedCategory;

            const matchesStatus = !this.selectedStatus ||
                item.status === this.selectedStatus;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }
}
