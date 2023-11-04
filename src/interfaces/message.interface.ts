import { User } from "./user.interface";

export interface Message {
    id:string,
    source:string,
    destination:string,
    destinationType:MessageDestinationType,
    delivered:boolean,
    read:boolean,
    messageType: MessageType,
    hasAttachment: boolean,
    sentAt: Date,
    receivedAt: Date,
    readAt: Date,
    edited: boolean
}

export interface MessageRequest {
    sender: string,
    receiver: string,
    message: string
}

export interface MessageSchema extends Document,Message {}

export enum MessageDestinationType {
    DM,
    GROUP,
    CHANNEL
}

export enum MessageType {
    DEFAULT,
    TEXT,
    IMAGE,
    GIF,
    AUDIO,
    STICKER,
    POLL,
    FILE,
    CONTACT,
    LOCATION,
    LIVE_LOCATION,
    VOICE,
    VIDEO,
    STICKER_ANIMATED,
    SIGNED
}