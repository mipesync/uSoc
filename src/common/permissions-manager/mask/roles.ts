import { Permissions } from "./permissions";

export enum Roles {
    CREATOR = Permissions.ACCESS_EDIT_ROOM | Permissions.ACCESS_DELETE_MESSAGES | Permissions.ACCESS_DELETE_USERS | Permissions.ACCESS_GIVE_ACCESS | Permissions.ACCESS_INVITE_USERS,
    MODERATOR = Permissions.ACCESS_DELETE_MESSAGES | Permissions.ACCESS_DELETE_USERS | Permissions.ACCESS_INVITE_USERS,
    MEMBER = Permissions.ACCESS_INVITE_USERS
}