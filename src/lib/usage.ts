import {RateLimiterPrisma} from 'rate-limiter-flexible';
import prisma from './db';
import { auth } from '@clerk/nextjs/server';

const FREE_POINTS = 5; // Number of free points for new users
const PREMIUM_POINTS = 100; // Points for premium users
const GENERATION_COST = 1; // Cost per generation  
const DURATION = 30 * 24 * 60 * 60; // Duration in seconds (30 days)

export async function getUsageTracker() {
    const {has} = await auth();
    const hasPremiumAccess = has({plan: 'pro'})
    const usageTracker = new RateLimiterPrisma({
        storeClient: prisma,
        tableName: 'Usage',
        points: hasPremiumAccess ? PREMIUM_POINTS: FREE_POINTS,
        duration: DURATION, 
    });
    return usageTracker;
}

export async function consumeCredits() {
    const {userId} = await auth();
    if (!userId) {
        throw new Error('User not authenticated')
    }
    
    const usageTracker = await getUsageTracker();
    const result = await usageTracker.consume(userId, GENERATION_COST); // Consume 1 point
    return result;
}

export async function getUsageStatus() {
    const {userId} = await auth();
    if (!userId) {
        throw new Error('User not authenticated')
    }

    const usageTracker = await getUsageTracker();
    const res = await usageTracker.get(userId);
    return res;
}
