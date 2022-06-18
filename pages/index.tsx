import { Input, Paper, Title } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import CommentItem from "components/CommentItem"
import Flex from "components/Flex"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { fetchRedditComments, IRedditComment } from "util/reddit"

const RedditOpinions = () => {
  const router = useRouter()
  const [debouncedQuery] = useDebouncedValue(router?.query?.query, 800)
  const [comments, setComments] = useState<IRedditComment[]>([])

  const fetchComments = async (debouncedQuery: string) => {
    const comments = await fetchRedditComments(debouncedQuery)
    setComments(comments)
  }

  useEffect(() => {
    fetchComments(debouncedQuery as string)
  }, [debouncedQuery])

  return (
    <Flex direction="column" align="stretch" spacing="xs" px="sm">
      <Paper sx={() => ({ maxWidth: "100%" })} mx="0" my="xs">
        <Input
          value={router?.query?.query || ""}
          onChange={(e) =>
            router.push(
              {
                query: { query: e.target.value },
              },
              undefined,
              { shallow: true }
            )
          }
        />
      </Paper>
      {/* <Paper sx={() => ({ maxWidth: "100%" })} mx="0" my="xs">
        <Flex align="center" justify="space-between">
          <Title order={1}>{router?.query?.query}</Title>
          <Title order={1}>{router?.query?.query}</Title>
        </Flex>
      </Paper> */}
      <Paper sx={() => ({ maxWidth: "100%" })} mx="0" my="xs">
        {comments?.map((comment) => (
          <CommentItem key={comment?.permalink} comment={comment} />
        ))}
      </Paper>
    </Flex>
  )
}

export default RedditOpinions
