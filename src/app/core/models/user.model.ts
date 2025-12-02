export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'PUBLIK' | 'MAHASISWA' | 'STAFF_DOSEN';
    identity_number: string;
    faculty?: string; // Required only for MAHASISWA
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    refresh_token: string;
    user: UserResponse;
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    role: string;
    identity_number: string;
    faculty?: string;
}

export interface UserDetailResponse extends UserResponse {
    phone: string;
}

export interface UpdateUserRequest {
    name?: string;
    phone?: string;
}
