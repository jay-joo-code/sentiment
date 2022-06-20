import { ActionIcon, Button, Input, Paper } from "@mantine/core"
import { useRouter } from "next/router"
import { memo, useEffect, useState } from "react"
import Flex from "./Flex"
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined"

const RedditQueryInput = () => {
  const [query, setQuery] = useState<string>()
  const router = useRouter()
  const [isRefreshed, setIsRefreshed] = useState<boolean>(false)

  useEffect(() => {
    if (!isRefreshed && router?.query?.query !== undefined) {
      setQuery(router?.query?.query as string)
      setIsRefreshed(true)
    }
  }, [router?.query?.query])

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
          sx={() => ({ flexGrow: 1, flexShrink: 1 })}
          placeholder="Topic"
          rightSection={
            <ActionIcon color="blue" variant="light">
              <SearchOutlinedIcon onClick={handleSearch} />
            </ActionIcon>
          }
        />
      </Flex>
    </Paper>
  )
}

export default memo(RedditQueryInput)
