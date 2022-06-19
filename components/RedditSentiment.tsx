import { Paper } from "@mantine/core"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import useSWR from "swr"
import { fetchRedditComments, IRedditComment } from "util/reddit"
import CommentItem from "./CommentItem"

interface IRedditSentimentProps {}

const RedditSentiment = ({}: IRedditSentimentProps) => {
  const router = useRouter()

  const { data } = useSWR(
    router?.query?.query
      ? `/api/sentiment?query=${router?.query?.query || ""}`
      : null
  )

  console.log("comments", data?.comments)

  if (!data?.comments || data?.comments?.length === 0) return null

  return (
    <Paper sx={() => ({ maxWidth: "100%" })} mx="0" my="xs">
      {data?.comments?.map((comment) => (
        <CommentItem key={comment?.permalink} comment={comment} />
      ))}
    </Paper>
  )
}

export default RedditSentiment
