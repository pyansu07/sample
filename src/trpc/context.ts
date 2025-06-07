import { inferAsyncReturnType } from '@trpc/server'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

export async function createContext(opts?: FetchCreateContextFnOptions) {
    return {
        // Add any context properties you need here
    }
}

export type Context = inferAsyncReturnType<typeof createContext> 