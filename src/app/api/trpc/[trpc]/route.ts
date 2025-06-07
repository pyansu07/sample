import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/trpc/routers/_app'
import { createContext } from '@/trpc/context'

const handler = async (req: Request) => {
  try {
    const response = await fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext: () => createContext(),
      onError:
        process.env.NODE_ENV === 'development'
          ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
              error.stack
            )
          }
          : undefined,
    })

    if (!response.headers.get('content-type')?.includes('application/json')) {
      return new Response(
        JSON.stringify({
          error: 'Invalid response type',
          message: 'Server returned non-JSON response',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    return response
  } catch (error) {
    console.error('TRPC handler error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

export { handler as GET, handler as POST }
