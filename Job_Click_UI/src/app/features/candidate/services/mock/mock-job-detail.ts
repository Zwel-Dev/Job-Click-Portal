import { Job, JobLocation, JobSkillRequirement, JobSummary } from '@core/models/job.model';
import { JobStatus } from '@core/enums/job-status.enum';

const SKILL_MAP: ReadonlyArray<{ match: RegExp; skills: string[] }> = [
  { match: /angular|frontend/i, skills: ['Angular', 'TypeScript', 'RxJS', 'HTML5', 'CSS3'] },
  { match: /react|vue/i, skills: ['React', 'JavaScript', 'TypeScript', 'CSS3'] },
  { match: /full ?stack/i, skills: ['Angular', 'Node.js', 'SQL', 'REST API'] },
  { match: /backend|node/i, skills: ['Node.js', 'Express.js', 'SQL', 'REST API'] },
  { match: /devops/i, skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'] },
  { match: /designer|ux/i, skills: ['Figma', 'UI/UX Design', 'Prototyping'] },
  { match: /data/i, skills: ['SQL', 'Python', 'Data Analysis'] },
  { match: /qa|test/i, skills: ['Cypress', 'Jest', 'Test Automation'] },
  { match: /mobile|flutter/i, skills: ['Flutter', 'Dart', 'REST API'] },
  { match: /product manager/i, skills: ['Agile/Scrum', 'Roadmapping', 'Stakeholder Management'] },
];

const BENEFITS = [
  'Health insurance',
  'Performance bonus',
  'Flexible working hours',
  'Learning & development budget',
  'Paid annual leave',
];

function deriveSkills(title: string): JobSkillRequirement[] {
  const entry = SKILL_MAP.find((item) => item.match.test(title));
  const names = entry ? entry.skills : ['Communication', 'Problem Solving', 'Teamwork'];
  return names.map((name, index) => ({ skillId: index + 1, name, required: index < 3 }));
}

function parseLocation(location: string): JobLocation {
  if (/remote/i.test(location)) {
    return { country: 'Myanmar', city: 'Remote' };
  }
  const [city, country] = location.split(',').map((part) => part.trim());
  return { country: country || 'Myanmar', city: city || location };
}

/** Expands a job summary into a full detail record (mock backend). */
export function buildJobDetail(summary: JobSummary): Job {
  return {
    ...summary,
    status: JobStatus.Published,
    description:
      `${summary.companyName} is hiring a ${summary.title} to join our ` +
      `${summary.industry ?? 'technology'} team based in ${summary.location}. ` +
      `You'll collaborate with a cross-functional team to design, build, and ship ` +
      `high-quality products used by customers across Myanmar. We value ownership, ` +
      `clean engineering, and continuous learning.`,
    requirements:
      `What we're looking for:\n` +
      `- Proven experience relevant to a ${summary.title} role\n` +
      `- Strong collaboration and communication skills\n` +
      `- An ownership mindset and attention to detail\n` +
      `- Comfortable working in an agile, fast-moving environment`,
    skills: deriveSkills(summary.title),
    benefits: BENEFITS,
    locations: [parseLocation(summary.location)],
  };
}
