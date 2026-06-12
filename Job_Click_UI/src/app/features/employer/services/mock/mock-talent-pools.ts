import { Id } from '@core/models/common.model';

/** Internal mock pool shape — membership is candidateId + addedAt; the rest resolves from the candidate directory. */
export interface MockTalentPool {
  id: Id;
  name: string;
  description?: string;
  createdAt: string;
  members: { candidateId: Id; addedAt: string }[];
}

/** Seed talent pools for the demo company. Candidate IDs map to MOCK_TALENT_POOL (candidate search). */
export const MOCK_TALENT_POOLS: MockTalentPool[] = [
  {
    id: 501, name: 'Frontend Engineers', description: 'Angular/React talent for upcoming web roles.',
    createdAt: '2026-05-28T09:00:00Z',
    members: [
      { candidateId: 1201, addedAt: '2026-06-09T08:00:00Z' },
      { candidateId: 1205, addedAt: '2026-06-07T10:00:00Z' },
    ],
  },
  {
    id: 502, name: 'DevOps & Cloud', description: 'Infrastructure and platform engineers.',
    createdAt: '2026-06-01T09:00:00Z',
    members: [
      { candidateId: 1204, addedAt: '2026-06-08T12:00:00Z' },
      { candidateId: 1207, addedAt: '2026-06-11T07:00:00Z' },
    ],
  },
  {
    id: 503, name: 'Leadership Bench', description: 'Senior and management-track candidates.',
    createdAt: '2026-06-04T09:00:00Z',
    members: [
      { candidateId: 1209, addedAt: '2026-06-06T15:00:00Z' },
    ],
  },
];
