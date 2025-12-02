export interface ItemResponse {
    id: string;
    title: string;
    category_id: string;
    category_name: string;
    image_url: string;
    status: 'OPEN' | 'CLAIMED' | 'RESOLVED';
    created_at: string;
    location_id?: string;
    location_name?: string;
    location_last_seen?: string;
    description?: string;
    type: 'LOST' | 'FOUND';
    date_lost?: string;
    date_found?: string;
    urgency?: 'NORMAL' | 'HIGH' | 'CRITICAL'; // For lost items
    offer_reward?: boolean; // For lost items
    show_phone?: boolean;
    contacts?: ContactResponse[];
    verifications?: VerificationResponse[]; // For found items
}

export interface ContactResponse {
    platform: string;
    value: string;
}

export interface VerificationResponse {
    id?: string;
    question: string;
    // answer is NOT included in response (hidden from claimer)
}

export interface CreateLostItemRequest {
    title: string;
    category_id: string;
    date_lost: string; // Format: YYYY-MM-DD
    location_last_seen: string; // Free text
    description?: string;
    image_url?: string;
    urgency?: 'NORMAL' | 'HIGH' | 'CRITICAL';
    offer_reward?: boolean;
    show_phone?: boolean;
    contacts?: ContactRequest[];
}

export interface CreateFoundItemRequest {
    title: string;
    category_id: string;
    location_id: string; // UUID from campus locations
    date_found: string; // YYYY-MM-DD
    image_url?: string;
    return_method: 'BRING_BY_FINDER' | 'HANDED_TO_SECURITY';
    cod?: boolean; // Cash on delivery
    show_phone?: boolean;
    contacts?: ContactRequest[];
    verifications: VerificationRequest[]; // REQUIRED - at least 1
}

export interface ContactRequest {
    platform: 'WHATSAPP' | 'INSTAGRAM' | 'TELEGRAM' | 'EMAIL' | 'OTHER';
    value: string;
}

export interface VerificationRequest {
    question: string;
    answer: string; // This will be hashed/hidden by backend
}

export interface CampusLocation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    description?: string;
}

export interface CreateCampusLocationRequest {
    name: string;
    latitude: number;
    longitude: number;
}

export interface ItemCategory {
    id: string;
    name: string;
    description?: string;
}

export interface Item {
    id: string;
    title: string;
    type: 'LOST' | 'FOUND';
    status: 'OPEN' | 'CLAIMED' | 'RESOLVED';
    category: ItemCategory;
    image_url: string;
    location?: CampusLocation;
    location_description?: string; // For lost items
    date_found?: string;
    date_lost?: string;
    urgency?: string;
    offer_reward?: boolean;
    show_phone: boolean;
    contacts: ItemContact[];
    verifications?: ItemVerification[]; // Only questions visible to claimer
    finder?: any; // User type to be defined if needed
    owner?: any; // User type to be defined if needed
    return_method?: string;
    cod?: boolean;
}

export interface ItemContact {
    platform: string;
    value: string;
}

export interface ItemVerification {
    id: string;
    question: string;
}

export interface Asset {
    id: string;
    description?: string;
    category_id: string;
    category_name?: string;
    private_image_url?: string;
    qr_code_url?: string;
    lost_mode: boolean;
    created_at: string;
    owner_id?: string;
}

export interface CreateAssetRequest {
    description: string;
    category_id: string;
    private_image_url?: string;
    lost_mode?: boolean;
}
