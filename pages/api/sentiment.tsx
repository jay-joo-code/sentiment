import { Prisma, RedditComment } from "@prisma/client"
import { withSentry } from "@sentry/nextjs"
import api from "lib/api"
import prisma from "lib/prisma"
import type { NextApiRequest, NextApiResponse } from "next"

async function handle(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      if (!req?.query?.query) {
        return res
          .status(400)
          .send({ message: "Enter a keyword to start the sentiment analysis" })
      }
      const query = (req?.query?.query as string)?.trim()

      // TODO: gather new sentiemt if most recent sentiment was gathered x months ago

      let topic = await prisma.topic.findFirst({
        where: {
          name: query,
        },
        include: {
          topComments: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      if (!topic) {)
        await fetchTopic(query)
        topic = await prisma.topic.findFirst({
          where: {
            name: query,
          },
          include: {
            topComments: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      }

      topic?.topComments?.sort((a, b) => {
        const sentiA = Math.abs(
          Number(a.sentimentScore) * Number(a.sentimentMagnitude) * a.ups
        )
        const sentiB = Math.abs(
          Number(b.sentimentScore) * Number(b.sentimentMagnitude) * b.ups
        )
        return sentiB - sentiA
      })
      res.json(topic)

      break

    case "POST":
      res.json({})
      break

    default:
      break
  }
}

type RawComment = Omit<
  RedditComment,
  "id" | "topicId" | "sentimentScore" | "sentimentMagnitude"
>

const fetchGoogleSentiment = async (content: string) => {
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
    })
    recurseReplies(allComments, reply?.data?.replies, url, reply?.data?.body)
  })
}

const fetchTopic = async (query: string) => {
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

  // filter comments that include query
  const filteredComments = allComments?.filter((comment) => {
    const matcher = query
      ?.split(" ")
      .filter((part) => part.trim().length !== 0)
      .map((part) => `${part}`)
      .join("|")

    const re = new RegExp(`\\b(${matcher})\\b`, "gi")
    const isBodyIncludesQuery = re.test(comment?.body)
    const isResponseToIncludesQuery = re.test(comment?.responseTo)

    return (
      (isBodyIncludesQuery || isResponseToIncludesQuery) && comment?.ups > 1
    )
  })

  // filter 10 most upvoted comments
  const bestComments = filteredComments
    ?.sort((commentA, commentB) => commentB?.ups - commentA?.ups)
    ?.slice(0, 10)

  const topic = await prisma.topic.create({
    data: {
      name: query,
      sentimentScore: 0,
      sentimentMagnitude: 0,
    },
  })

  // fetch sentiment data
  let topicSentimentScore = 0
  let topicSentimentMagnitude = 0

  const saveCommentsPromises = bestComments?.map(async (comment) => {
    const content = `${comment?.responseTo}. ${comment?.body}`

    const { documentSentiment } = await fetchGoogleSentiment(content)

    topicSentimentScore += documentSentiment?.score
    topicSentimentMagnitude += documentSentiment?.magnitude

    const commentRecord = await prisma.redditComment.create({
      data: {
        ...comment,
        topicId: topic.id,
        sentimentScore: new Prisma.Decimal(documentSentiment?.score),
        sentimentMagnitude: new Prisma.Decimal(documentSentiment?.magnitude),
      },
    })

    // view comment sentiment logs
    // console.log("")
    // console.log("***")
    // console.log("")
    // console.log(content)
    // console.log("documentSentiment", documentSentiment)

    // sentiment entity filter logic
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

    return commentRecord
  })

  await Promise.all(saveCommentsPromises)

  await prisma.topic.update({
    where: {
      id: topic.id,
    },
    data: {
      sentimentScore: topicSentimentScore,
      sentimentMagnitude: topicSentimentMagnitude,
    },
  })

  return topic
}

export default withSentry(handle)
