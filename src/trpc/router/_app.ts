import { z } from 'zod';
import { createTRPCRouter } from '../init';
import { messageRouter } from '@/modules/messages/server/procedures';
import { projectsRouter } from '@/modules/projects/server/procedures';
import { usageRouter } from '@/modules/usage/server/procedure';
export const appRouter = createTRPCRouter({
  messages: messageRouter,
  projects:projectsRouter,
  usages: usageRouter,
  // fragments:FragmentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
