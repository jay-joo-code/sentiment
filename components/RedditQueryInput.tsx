import { Input, Paper } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { useRouter } from "next/router"
import React, { memo, useEffect, useState } from "react"

interface IRedditQueryInputProps {}

const RedditQueryInput = ({}: IRedditQueryInputProps) => {
  const [query, setQuery] = useState<string>()
  const [isRefreshed, setIsRefreshed] = useState<boolean>(false)

  const [debouncedQuery] = useDebouncedValue(query, 500)
  const router = useRouter()

  useEffect(() => {
    if (debouncedQuery !== undefined) {
      router.push(
        {
          query: { query: debouncedQuery },
        },
        undefined,
        { shallow: true }
      )
    }
  }, [debouncedQuery])

  useEffect(() => {
    if (!isRefreshed && router?.query?.query !== undefined) {
      setQuery(router?.query?.query as string)
      setIsRefreshed(true)
    }
  }, [router?.query?.query])

  return (
    <div>
      <Paper sx={() => ({ maxWidth: "100%" })} mx="0" my="xs">
        <Input value={query || ""} onChange={(e) => setQuery(e.target.value)} />
      </Paper>
    </div>
  )
}

export default memo(RedditQueryInput)
