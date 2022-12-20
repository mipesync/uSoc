export class UserRoomsViewModel {
    roomId: string;
    avatarUrl?: string;
    name: string;
    lastMessage?: {
        userId?: string,
        text?: string
    }
}