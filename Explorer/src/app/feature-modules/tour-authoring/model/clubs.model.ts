export interface Clubs {
    id?: number,
    name: string,
    description: string,
    image: string,
    imageId: number,
    ownerId?: number,
    memberIds: number[]; // Array of user IDs who are members of the club
    invitationIds: number[];
    requestIds: number[];
}