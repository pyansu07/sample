declare module '@tanstack/react-query' {
    export * from '@tanstack/react-query'
}

declare module '@trpc/client' {
    export * from '@trpc/client'
}

declare module '@trpc/react-query' {
    export * from '@trpc/react-query'
}

declare module '@trpc/server' {
    export * from '@trpc/server'
}

declare module 'superjson' {
    interface SuperJSON {
        parse<T>(json: string): T
        stringify<T>(value: T): string
        serialize<T>(value: T): { json: string; meta?: unknown }
        deserialize<T>(value: { json: string; meta?: unknown }): T
    }
    const superjson: SuperJSON
    export default superjson
} 