import { Button, Input, Paper } from "@mantine/core"
import { useRouter } from "next/router"
import { memo, useState } from "react"
import Flex from "./Flex"

const RedditQueryInput = () => {
  const [query, setQuery] = useState<string>()
  const router = useRouter()

  const handleSearch = () => {
    router.push(
      {
        query: { query },
      },
      undefined,
      { shallow: true }
    )
  }

  const handleEnterKeyDown = (event) => {
    if (event.key === "Enter") {
      router.push(
        {
          query: { query },
        },
        undefined,
        { shallow: true }
      )
    }
  }

  return (
    <Paper sx={() => ({ maxWidth: "100%" })} mx="0" my="xs">
      <Flex align="center">
        <Input
          value={query || ""}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleEnterKeyDown}
          sx={() => ({ flexGrow: 1 })}
        />
        <Button onClick={handleSearch}>Search</Button>
      </Flex>
    </Paper>
  )
}

export default memo(RedditQueryInput)
