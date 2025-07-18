export interface UserProfile {
    id:number,
    firstName: string;
    lastName: string;
    imageURL: string;
    biography: string;
    motto: string;
    xp?: number;
    email?: string;
}