import { inferAsyncReturnType } from '@trpc/server'

export async function createContext() {
    return {
        // Add any context properties you need here
    }
}

export type Context = inferAsyncReturnType<typeof createContext> 