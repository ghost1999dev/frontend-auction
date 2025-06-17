// Request interfaces
export interface CreateCategoryRequest {
    name: string;
  }
  
  export interface UpdateCategoryRequest {
    name: string;
  }
  
  // Response interfaces
  export interface Category {
    id: number;
    name: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface CreateCategory {
    name: string;
  }
  
  export interface UpdateCategory {
    name: string;
  }

export interface CategoryResponse {
  message: string;
  categories: Category[];
  status: number;
}

export interface CategoryResponseById {
  message: string;
  category: Category;
  status: number;
}

export interface CategoryResponseAddUpdate {
    message: string;
    category: Category;
    status: number;
  }