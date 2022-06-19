import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../../lib/prisma"
import { getSession } from "next-auth/react"
import { withSentry } from "@sentry/nextjs"
import api from "lib/api"
import { RedditComment } from "@prisma/client"

async function handle(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      if (!req?.query?.query) {
        return res
          .status(400)
          .send({ message: "Enter a keyword to start the sentiment analysis" })
      }

      const comments = await fetchRedditComments(req?.query?.query as string)

      res.json({ comments })
      break

    case "POST":
      res.json({})
      break

    default:
      break
  }
}

type RawComment = Omit<RedditComment, "id" | "sentimentId">

const fetchSentiment = async (content: string) => {
  const URL = `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${process.env.GOOGLE_API_KEY}`

  const { data } = await api.post(URL, {
    document: {
      content,
      type: "PLAIN_TEXT",
    },
    encodingType: "UTF32",
  })

  return data
}

const recurseReplies = (
  allComments: RawComment[],
  replies,
  url,
  responseTo
) => {
  if (!replies) return

  replies?.data?.children?.map((reply) => {
    // console.log(
    //   "reply",
    //   url,
    //   reply?.data?.body,
    //   reply?.data?.ups,
    //   reply?.data?.permalink,
    //   reply?.data?.replies,
    //   {
    //     body: reply?.data?.body,
    //     permalink: reply?.data?.permalink,
    //     ups: reply?.data?.ups,
    //     createdAt: new Date(reply?.data?.created_utc),
    //   }
    // )
    const createdAt = new Date(0)
    createdAt.setUTCSeconds(Number(reply?.data?.created_utc))
    allComments.push({
      body: reply?.data?.body,
      responseTo,
      permalink: reply?.data?.permalink,
      ups: reply?.data?.ups,
      createdAt,
      sentimentScore: 0,
      sentimentMagnitude: 0,
    })
    recurseReplies(allComments, reply?.data?.replies, url, reply?.data?.body)
  })
}

const fetchRedditComments = async (query: string) => {
  console.log("query", query)
  const allComments: RawComment[] = []

  const { data } = await api.get(
    `https://www.reddit.com/r/Cornell/search/.json?q=${encodeURIComponent(
      query
    )}&limit=30&restrict_sr=1&sr_nsfw=`
  )

  const promises = data?.data?.children?.map(async (post) => {
    const { data: postData } = await api.get(
      `https://www.reddit.com${post?.data?.permalink}.json`
    )

    const rootPost = postData[0]?.data?.children[0]?.data

    const createdAt = new Date(0)
    createdAt.setUTCSeconds(Number(rootPost?.created_utc))

    allComments.push({
      body: !!rootPost?.selftext ? rootPost?.selftext : rootPost?.title,
      responseTo: rootPost?.selftext ? rootPost?.title : "",
      permalink: rootPost?.permalink,
      ups: rootPost?.ups,
      createdAt,
      sentimentScore: 0,
      sentimentMagnitude: 0,
    })

    if (postData && postData?.length >= 2) {
      const comments = postData[1]?.data?.children
      comments.map((comment) => {
        // console.log(
        //   "postData",
        //   post?.data?.url,
        //   comment?.data?.body,
        //   comment?.data?.ups,
        //   comment?.data?.permalink,
        //   comment?.data?.replies
        // )
        const createdAt = new Date(0)
        createdAt.setUTCSeconds(Number(comment?.data?.created_utc))
        allComments.push({
          body: comment?.data?.body,
          responseTo: postData[0]?.data?.children[0]?.data?.title,
          permalink: comment?.data?.permalink,
          ups: comment?.data?.ups,
          createdAt,
          sentimentScore: 0,
          sentimentMagnitude: 0,
        })
        recurseReplies(
          allComments,
          comment?.data?.replies,
          post?.data?.url,
          comment?.data?.body
        )
      })
    }
  })

  await Promise.all(promises)

  // filter by query
  const filteredComments = allComments?.filter((comment) => {
    const matcher = query
      ?.split(" ")
      .filter((part) => part.trim().length !== 0)
      .map((part) => `${part}`)
      .join("|")

    const re = new RegExp(`\\b(${matcher})\\b`, "gi")
    const isIncludesQuery = re.test(comment?.body)

    return isIncludesQuery && comment?.ups > 1
  })

  // filter 10 most upvoted comments
  const bestComments = filteredComments
    ?.sort((commentA, commentB) => commentB?.ups - commentA?.ups)
    ?.slice(0, 10)

  // fetch sentiment data

  const sentimentPromises = bestComments?.map(async (comment) => {
    const content = `${comment?.responseTo}. ${comment?.body}`
    const { documentSentiment } = await fetchSentiment(content)
    comment.sentimentScore = documentSentiment?.score
    comment.sentimentMagnitude = documentSentiment?.magnitude

    // view comment sentiment logs
    // console.log("")
    // console.log("***")
    // console.log("")
    // console.log(content)
    // console.log("documentSentiment", documentSentiment)

    // entity sentiment filter logic
    // const filteredEntities = entities?.filter(({ name, sentiment }) => {
    //   const matcher = query
    //     ?.toLowerCase()
    //     ?.split(" ")
    //     .filter((part) => part.trim().length !== 0)
    //     .map((part) => `${part}`)
    //     .join("|")

    //   const re = new RegExp(`\\b(${matcher})\\b`, "gi")
    //   const isRelatedEntity = re.test(name)

    //   // const queryWords = query?.toLowerCase()?.split(" ")
    //   // const isRelatedEntity = queryWords.some((substring) => {
    //   //   console.log(
    //   //     "name, substring, name?.toLowerCase()?.includes(substring)",
    //   //     name,
    //   //     substring,
    //   //     name?.toLowerCase()?.includes(substring)
    //   //   )
    //   //   return name?.toLowerCase()?.includes(substring)
    //   // })

    //   console.log(isRelatedEntity, name, sentiment?.score, sentiment?.magnitude)

    //   // if (isRelatedEntity) {
    //   //   console.log(name, sentiment?.score, sentiment?.magnitude)
    //   // }
    //   return isRelatedEntity
    // })

    return comment
  })

  const populatedComments = await Promise.all(sentimentPromises)

  return populatedComments
}

export default withSentry(handle)
