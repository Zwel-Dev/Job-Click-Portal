import { Id } from './common.model';

/** A file attached to a message. */
export interface MessageAttachment {
  id: Id;
  fileName: string;
  fileUrl: string;
  sizeLabel?: string;
}

export type InterviewInviteStatus = 'pending' | 'accepted' | 'declined';

/** An interview invitation carried inline in a message (links to an INTERVIEWS record server-side). */
export interface InterviewInvite {
  jobTitle: string;
  proposedAt: string;
  /** 'On-site' | 'Online' | 'Phone'. */
  mode: string;
  location?: string;
  status: InterviewInviteStatus;
}

/** A single message in a conversation (mirrors MESSAGES). */
export interface Message {
  id: Id;
  conversationId: Id;
  senderId: Id;
  senderName: string;
  body: string;
  sentAt: string;
  attachments?: MessageAttachment[];
  /** Present when this message is an interview invitation (rendered as a card). */
  interviewInvite?: InterviewInvite;
}

/**
 * A conversation summary for the list/panel (mirrors CONVERSATIONS +
 * CONVERSATION_PARTICIPANTS, resolved to the other participant for the current user).
 */
export interface Conversation {
  id: Id;
  participantName: string;
  participantRole?: string;
  /** The job this conversation is about, if any. */
  jobTitle?: string;
  lastMessage: string;
  lastMessageAt: string;
  /** Unread messages for the current user. */
  unread: number;
}

/** Payload emitted by the composer when sending. */
export interface OutgoingMessage {
  body: string;
  attachments: MessageAttachment[];
}
