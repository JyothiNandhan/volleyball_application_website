import { validateTeamCount } from '@/validation/team';

describe('team count validation', () => {
  it('rejects zero teams', () => {
    expect(validateTeamCount(10, 0).valid).toBe(false);
  });

  it('rejects negative teams', () => {
    expect(validateTeamCount(10, -1).valid).toBe(false);
  });

  it('rejects too many teams', () => {
    expect(validateTeamCount(8, 5).valid).toBe(false);
  });

  it('accepts valid team counts', () => {
    expect(validateTeamCount(14, 2).valid).toBe(true);
    expect(validateTeamCount(14, 3).valid).toBe(true);
  });
});
