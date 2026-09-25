import { z } from 'zod';

export const CategoryEnum = z.enum([
  'IMPORTANT_URGENT',
  'IMPORTANT_NOT_URGENT',
  'NOT_IMPORTANT_URGENT',
  'NOT_IMPORTANT_NOT_URGENT',
]);

export const RepeatTypeEnum = z.enum([
  'none',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'custom',
]);

export const DayOfWeekEnum = z.enum([
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
]);

export const RepeatConfigSchema = z.object({
  interval: z.number().int().min(1).default(1).optional(),
  days: z.array(DayOfWeekEnum).optional(),
  until: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD')
    .nullable()
    .optional(),
});

export const RepeatSchema = z.object({
  type: RepeatTypeEnum.default('none'),
  interval: z.number().int().min(1).default(1).optional(),
  days: z.array(DayOfWeekEnum).optional(),
  until: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD')
    .nullable()
    .optional(),
});

// Helper to check if end time is after start time
function isEndTimeAfterStartTime(start: string, end: string): boolean {
  const [startH, startM] = start.slice(0, 5).split(':').map(Number);
  const [endH, endM] = end.slice(0, 5).split(':').map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  return endTotal > startTotal;
}

export const CreateScheduleSchema = z
  .object({
    title: z.string().min(1, 'Title cannot be empty').max(255, 'Title too long'),
    category: CategoryEnum,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    start: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Start time must be in HH:mm format'),
    end: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'End time must be in HH:mm format'),
    repeat: RepeatSchema.optional().default({ type: 'none' }),
    timezone: z.string().default('Asia/Makassar').optional(),
  })
  .refine(
    (data) => isEndTimeAfterStartTime(data.start, data.end),
    {
      message: 'End time must be after start time',
      path: ['end'],
    }
  );

export const PatchScheduleSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    category: CategoryEnum.optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    start: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
    end: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
    repeat: RepeatSchema.optional(),
    timezone: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.start && data.end) {
        return isEndTimeAfterStartTime(data.start, data.end);
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['end'],
    }
  );

export type CreateScheduleInput = z.infer<typeof CreateScheduleSchema>;
export type PatchScheduleInput = z.infer<typeof PatchScheduleSchema>;
