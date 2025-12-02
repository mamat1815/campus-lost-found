import { UserResponse } from './user.model';

export interface CreateClaimRequest {
    answer_input: string; // Combined answers or structured JSON
    image_url?: string; // Proof image (ID card, photo of item)
}

export interface ClaimResponse {
    id: string;
    item_id: string;
    owner_id: string;
    answer_input: string;
    image_url?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    created_at: string;
}

export interface Claim {
    id: string;
    item_id: string;
    owner: UserResponse; // Claimer info
    answer_input: string; // Answers provided
    image_url?: string; // Proof image
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    created_at: string;
}
