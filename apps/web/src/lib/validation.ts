import type { ReactNode } from 'react'
import z from 'zod'
import { redirect } from 'next/navigation'
import { getErrorPayload, toErrorSearchParams } from '@/lib/error'

export type PageInput = {
  searchParams?: Promise<unknown>
  params?: Promise<unknown>
}

export async function getValidatedParams<TQuery>(
  options: { querySchema: z.ZodSchema<TQuery>; paramsSchema?: undefined },
  page: PageInput,
): Promise<{ query: TQuery; params?: undefined }>

export async function getValidatedParams<TParams>(
  options: { querySchema?: undefined; paramsSchema: z.ZodSchema<TParams> },
  page: PageInput,
): Promise<{ query?: undefined; params: TParams }>

export async function getValidatedParams<TQuery, TParams>(
  options: {
    querySchema: z.ZodSchema<TQuery>
    paramsSchema: z.ZodSchema<TParams>
  },
  page: PageInput,
): Promise<{ query: TQuery; params: TParams }>

export async function getValidatedParams<TQuery, TParams>(
  {
    querySchema,
    paramsSchema,
  }: {
    querySchema?: z.ZodSchema<TQuery>
    paramsSchema?: z.ZodSchema<TParams>
  },
  page: PageInput,
): Promise<{ query?: TQuery; params?: TParams }> {
  let query: TQuery | undefined
  let params: TParams | undefined
  if (querySchema) {
    const result = await querySchema.safeParseAsync(await page.searchParams)
    if (!result.success) {
      return redirect(
        `/error?${toErrorSearchParams(getErrorPayload(result.error))}`,
      )
    }
    query = result.data
  }
  if (paramsSchema) {
    const result = await paramsSchema.safeParseAsync(await page.params)
    if (!result.success) {
      return redirect(
        `/error?${toErrorSearchParams(getErrorPayload(result.error))}`,
      )
    }
    params = result.data
  }
  return { query, params } as { query?: TQuery; params?: TParams }
}

/** Page callback receives only query (typed). */
export function withValidatedParams<TQuery>(
  options: { querySchema: z.ZodSchema<TQuery>; paramsSchema?: undefined },
  Page: (props: { query: TQuery }) => Promise<ReactNode> | ReactNode,
): (props: PageInput) => Promise<ReactNode>

/** Page callback receives only params (typed). */
export function withValidatedParams<TParams>(
  options: { querySchema?: undefined; paramsSchema: z.ZodSchema<TParams> },
  Page: (props: { params: TParams }) => Promise<ReactNode> | ReactNode,
): (props: PageInput) => Promise<ReactNode>

/** Page callback receives both query and params (typed). */
export function withValidatedParams<TQuery, TParams>(
  options: {
    querySchema: z.ZodSchema<TQuery>
    paramsSchema: z.ZodSchema<TParams>
  },
  Page: (props: { query: TQuery; params: TParams }) => Promise<ReactNode> | ReactNode,
): (props: PageInput) => Promise<ReactNode>

export function withValidatedParams<TQuery, TParams>(
  options: {
    querySchema?: z.ZodSchema<TQuery>
    paramsSchema?: z.ZodSchema<TParams>
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Page: (props: any) => Promise<ReactNode> | ReactNode,
): (props: PageInput) => Promise<ReactNode> {
  return async (pageProps) => {
    const result = await getValidatedParams(
      options as Parameters<typeof getValidatedParams>[0],
      pageProps,
    )
    return Page(result)
  }
}
