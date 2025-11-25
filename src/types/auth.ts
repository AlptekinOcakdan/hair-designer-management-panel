export interface User {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    emailVerified: boolean;
    phoneVerified?: boolean;
    TOSAccepted: boolean;
    createdAt: string;
}

export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface ApiError {
    message: string;
    statusCode: number;
}