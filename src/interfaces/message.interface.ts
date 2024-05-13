import { Document } from 'mongoose'

export interface Message {
  source: string
  destination: string
  destinationType: MessageDestinationType
  content: string
  messageType: MessageType
  sentAt: Date
  delivered?: boolean
  read?: boolean
  hasAttachment?: boolean
  receivedAt?: Date
  readAt?: Date
  edited?: boolean
  attachmentId?: string
  isForwarded?: boolean
  messageStatus: MessageStatus,
  isReply?: boolean
  replyOf?: string
}

export interface MessageRequest {
  source: string
  destination: string
  destinationType: MessageDestinationType
  content: string
  messageType: MessageType
  sentAt: Date
  hasAttachment: boolean
  requestId: string
  isForwarded?: boolean
  isReply?: boolean
  replyOf?: string
}

export interface MessageResponse extends Message {
  messageId: string
}

export interface MessageSchema extends Document, Message { }

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

export enum MessageStatus {
  QUEUED,
  FAILED,
  SENT,
  DELIVERED,
  READ
}

export interface DeliveredRequest {
  messageId: string
  source: string
  acknowledgedBy: string
  deliveredAt: Date
}

export interface ReadRequest {
  messageId: string
  source: string
  acknowledgedBy: string
  readAt: Date
}

export interface AcknowledgeResponse {
  requestId: string
  messageId: string
}

export interface MessageUpdate {
  messageId: string
  content?: string
  delivered?: boolean
  read?: boolean
  receivedAt?: Date
  readAt?: Date
  edited?: boolean
  isForwarded?: boolean
  messageStatus?: MessageStatus
}
