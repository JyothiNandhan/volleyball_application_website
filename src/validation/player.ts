import { z } from 'zod';

export const playerInputSchema = z.object({
  name: z.string().trim().min(1, 'Player name is required').max(80, 'Name is too long'),
  position: z.enum([
    'setter',
    'outside_hitter',
    'opposite',
    'middle_blocker',
    'libero',
    'flexible'
  ]),
  rating: z.number().int().min(1, 'Choose at least 1 star').max(5, 'Ratings cannot exceed 5'),
  isPlaying: z.boolean(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional().nullable(),
  photoUrl: z.string().url().optional().nullable()
});

export type PlayerInput = z.infer<typeof playerInputSchema>;
