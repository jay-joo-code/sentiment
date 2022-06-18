import { Paper } from "@mantine/core"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { fetchRedditComments, IRedditComment } from "util/reddit"
import CommentItem from "./CommentItem"

interface IRedditSentimentProps {}

const RedditSentiment = ({}: IRedditSentimentProps) => {
  const router = useRouter()
  const [comments, setComments] = useState<IRedditComment[]>([])

  const fetchComments = async (debouncedQuery: string) => {
    const comments = await fetchRedditComments(debouncedQuery)
    setComments(comments)
  }

  useEffect(() => {
    if (router?.query?.query && router?.query?.query?.length > 0) {
      fetchComments(router?.query?.query as string)
    }
  }, [router?.query?.query])

  if (!comments || comments?.length === 0) return null

  return (
    <Paper sx={() => ({ maxWidth: "100%" })} mx="0" my="xs">
      {comments?.map((comment) => (
        <CommentItem key={comment?.permalink} comment={comment} />
      ))}
    </Paper>
  )
}

export default RedditSentiment
