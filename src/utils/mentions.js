// Simple @mentions suggester from a local list
export const mentionUsers = [
  { id: 1, name: 'HR Team' },
  { id: 2, name: 'Hiring Manager' },
  { id: 3, name: 'Tech Lead' },
  { id: 4, name: 'Recruiter' },
];
export function extractMentions(text) {
  const regex = /@([\w\s]+)/g;
  const result = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    result.push(match[1].trim());
  }
  return result;
}
