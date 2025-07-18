export enum NotificationType {
    TourProblem = 0,
    PublicRequest = 1,
    TourRefund = 2,
    Achievement = 3,
    GroupCancelation = 4
}

export interface Notification {
    id: number;
    content: string;
    type: NotificationType;
    referenceId: number;
    recieverId: number;
    isRead: boolean;
    imagePath: string;
}
