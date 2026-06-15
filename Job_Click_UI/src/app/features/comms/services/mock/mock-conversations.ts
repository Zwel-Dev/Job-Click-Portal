import { Conversation, InterviewInvite, Message } from '@core/models/messaging.model';
import { Id } from '@core/models/common.model';
import { RoleCode } from '@core/enums/role-code.enum';

/** The signed-in user, used to mark which messages are "mine". */
export interface MockCurrentUser {
  id: Id;
  name: string;
  roles: readonly RoleCode[];
}

interface ConversationSeed {
  conversation: Conversation;
  otherId: Id;
  messages: Array<{ fromMe: boolean; body: string; sentAt: string; invite?: InterviewInvite }>;
}

/** Role-appropriate conversations for the signed-in user. */
export function buildMockConversations(user: MockCurrentUser): Conversation[] {
  return seedsFor(user).map((seed) => ({ ...seed.conversation }));
}

/** Messages for one conversation, with sender resolved against the current user. */
export function buildMockMessages(conversationId: Id, user: MockCurrentUser): Message[] {
  const seed = seedsFor(user).find((item) => item.conversation.id === conversationId);
  if (!seed) {
    return [];
  }
  return seed.messages.map((message, index) => ({
    id: conversationId * 100 + index,
    conversationId,
    senderId: message.fromMe ? user.id : seed.otherId,
    senderName: message.fromMe ? user.name : seed.conversation.participantName,
    body: message.body,
    sentAt: message.sentAt,
    interviewInvite: message.invite,
  }));
}

function seedsFor(user: MockCurrentUser): ConversationSeed[] {
  return user.roles.includes(RoleCode.Candidate) ? CANDIDATE_SEEDS : EMPLOYER_SEEDS;
}

const CANDIDATE_SEEDS: ConversationSeed[] = [
  {
    conversation: { id: 1, participantName: 'Kyaw Zin Latt', participantRole: 'Recruiter · Greenline Technologies', jobTitle: 'Frontend Engineer (Angular)', lastMessage: 'Do you have time for a quick call this week?', lastMessageAt: '2026-06-14T08:10:00Z', unread: 2 },
    otherId: 2,
    messages: [
      { fromMe: false, body: 'Hi! Thanks for applying to the Frontend Engineer role.', sentAt: '2026-06-14T07:50:00Z' },
      { fromMe: true, body: 'Thank you! I am very interested in the position.', sentAt: '2026-06-14T08:00:00Z' },
      { fromMe: false, body: 'Great — your Angular experience looks strong.', sentAt: '2026-06-14T08:05:00Z' },
      { fromMe: false, body: 'Do you have time for a quick call this week?', sentAt: '2026-06-14T08:10:00Z' },
    ],
  },
  {
    conversation: { id: 2, participantName: 'Min Khant Kyaw', participantRole: 'Recruiter · BlueWave Logistics', jobTitle: 'Logistics Coordinator', lastMessage: 'Interview invitation · Logistics Coordinator', lastMessageAt: '2026-06-13T11:00:00Z', unread: 1 },
    otherId: 6,
    messages: [
      { fromMe: false, body: 'Hello, we reviewed your application for Logistics Coordinator.', sentAt: '2026-06-13T10:30:00Z' },
      { fromMe: true, body: 'Hi, thanks for reaching out!', sentAt: '2026-06-13T10:45:00Z' },
      { fromMe: false, body: '', sentAt: '2026-06-13T11:00:00Z', invite: { jobTitle: 'Logistics Coordinator', proposedAt: '2026-06-20T03:30:00Z', mode: 'Online', location: 'A Google Meet link will be shared before the call.', status: 'pending' } },
    ],
  },
  {
    conversation: { id: 3, participantName: 'Hnin Wai Yan', participantRole: 'Recruiter · BrightPath Solutions', jobTitle: 'Data Analyst', lastMessage: 'Could you share a portfolio link?', lastMessageAt: '2026-06-11T09:20:00Z', unread: 0 },
    otherId: 9,
    messages: [
      { fromMe: false, body: 'Thanks for your interest in the Data Analyst role.', sentAt: '2026-06-11T09:00:00Z' },
      { fromMe: false, body: 'Could you share a portfolio link?', sentAt: '2026-06-11T09:20:00Z' },
    ],
  },
];

const EMPLOYER_SEEDS: ConversationSeed[] = [
  {
    conversation: { id: 11, participantName: 'Su Su Hlaing', participantRole: 'Candidate · Frontend Engineer', jobTitle: 'Frontend Engineer (Angular)', lastMessage: 'Thank you! I am very interested in the position.', lastMessageAt: '2026-06-14T08:00:00Z', unread: 1 },
    otherId: 1,
    messages: [
      { fromMe: true, body: 'Hi! Thanks for applying to the Frontend Engineer role.', sentAt: '2026-06-14T07:50:00Z' },
      { fromMe: false, body: 'Thank you! I am very interested in the position.', sentAt: '2026-06-14T08:00:00Z' },
    ],
  },
  {
    conversation: { id: 12, participantName: 'Ei Ei Phyo', participantRole: 'Candidate · Data Analyst', jobTitle: 'Data Analyst', lastMessage: 'Sure, I can send my portfolio today.', lastMessageAt: '2026-06-14T09:40:00Z', unread: 1 },
    otherId: 7,
    messages: [
      { fromMe: true, body: 'Hello, could you share a portfolio link?', sentAt: '2026-06-14T09:10:00Z' },
      { fromMe: false, body: 'Sure, I can send my portfolio today.', sentAt: '2026-06-14T09:40:00Z' },
    ],
  },
  {
    conversation: { id: 13, participantName: 'Khin Myat Noe', participantRole: 'Candidate · Product Designer', jobTitle: 'Product Designer', lastMessage: 'Looking forward to the next steps.', lastMessageAt: '2026-06-12T15:00:00Z', unread: 0 },
    otherId: 11,
    messages: [
      { fromMe: false, body: 'Hi, is the Product Designer role still open?', sentAt: '2026-06-12T14:30:00Z' },
      { fromMe: true, body: 'Yes! We are reviewing applications now.', sentAt: '2026-06-12T14:50:00Z' },
      { fromMe: false, body: 'Looking forward to the next steps.', sentAt: '2026-06-12T15:00:00Z' },
    ],
  },
];
