import { z } from 'zod';
import { CategoryEnum } from '@/lib/schedule/validation';

export const AssignmentStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']);

export const CreateAssignmentSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(255, 'Title too long'),
  course_name: z.string().max(100).nullable().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format'),
  due_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Due time must be in HH:mm format')
    .default('23:59')
    .optional(),
  estimated_duration_minutes: z
    .number()
    .int()
    .min(5, 'Minimum 5 minutes')
    .max(1440, 'Maximum 1440 minutes')
    .default(120)
    .optional(),
  category: CategoryEnum,
  status: AssignmentStatusEnum.default('PENDING').optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const PatchAssignmentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  course_name: z.string().max(100).nullable().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  due_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  estimated_duration_minutes: z.number().int().min(5).max(1440).optional(),
  category: CategoryEnum.optional(),
  status: AssignmentStatusEnum.optional(),
  notes: z.string().max(2000).nullable().optional(),
  completed_at: z.string().nullable().optional(),
});

export type CreateAssignmentInput = z.infer<typeof CreateAssignmentSchema>;
export type PatchAssignmentInput = z.infer<typeof PatchAssignmentSchema>;
