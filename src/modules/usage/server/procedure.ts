import { consumeCredits, getUsageStatus } from "@/lib/usage";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const usageRouter = createTRPCRouter({
    getUsageStatus: protectedProcedure.query(async () => {
        try{
            const usageStatus = await getUsageStatus();
            return usageStatus;
        }catch (e){
            return null;
        }
    }),
    
    consumeCredits: protectedProcedure.mutation(async ({ ctx }) => {
        try{
            await consumeCredits();
        }catch (error) {
            if (error instanceof Error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: error.message,
                });
            }else{
                throw new TRPCError({
                    code: 'TOO_MANY_REQUESTS',
                    message: 'You have exceeded your usage limit. Please try again later.',
                });
            }

        }
    }),
})