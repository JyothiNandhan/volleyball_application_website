import { playerInputSchema } from '@/validation/player';

describe('player validation', () => {
  it('rejects empty names', () => {
    const result = playerInputSchema.safeParse({
      name: '',
      position: 'setter',
      rating: 3,
      isPlaying: true
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid ratings', () => {
    const result = playerInputSchema.safeParse({
      name: 'Alex',
      position: 'setter',
      rating: 6,
      isPlaying: true
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid players', () => {
    const result = playerInputSchema.safeParse({
      name: 'Alex',
      position: 'setter',
      rating: 4,
      isPlaying: true,
      notes: 'Captain'
    });
    expect(result.success).toBe(true);
  });
});
