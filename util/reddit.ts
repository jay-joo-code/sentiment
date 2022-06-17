import api from "lib/api"
import { courseKeywords } from "./redditKeywords"

export interface IRedditComment {
  body: string
  responseTo: string
  permalink: string
  ups: number
  createdAt: Date
}

export const fetchRedditComments = async (query: string) => {
  courseKeywords[query] = 0
  const allComments: IRedditComment[] = []

  const { data } = await api.get(
    `https://www.reddit.com/r/Cornell/search/.json?q=${encodeURIComponent(
      query
    )}%20NOT%20schedule&limit=30&restrict_sr=1&sr_nsfw=`
  )

  const recurseReplies = (replies, url, responseTo) => {
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
      allComments.push({
        body: reply?.data?.body,
        responseTo,
        permalink: reply?.data?.permalink,
        ups: reply?.data?.ups,
        createdAt: new Date(reply?.data?.created_utc),
      })
      recurseReplies(reply?.data?.replies, url, reply?.data?.body)
    })
  }

  const promises = data?.data?.children?.map(async (post) => {
    const { data: postData } = await api.get(
      `https://www.reddit.com${post?.data?.permalink}.json`
    )
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
        allComments.push({
          body: comment?.data?.body,
          responseTo: postData[0]?.data?.children[0]?.data?.title,
          permalink: comment?.data?.permalink,
          ups: comment?.data?.ups,
          createdAt: new Date(comment?.data?.created_utc),
        })
        recurseReplies(
          comment?.data?.replies,
          post?.data?.url,
          comment?.data?.body
        )
      })
    }
  })

  await Promise.all(promises)

  const filteredComments = allComments?.filter((comment) => {
    const matcher = Object.keys(courseKeywords)
      .filter((part) => part.trim().length !== 0)
      .map((part) => `${part}`)
      .join("|")

    const re = new RegExp(`\\b(${matcher})\\b`, "gi")

    const hasKeyword = re.test(comment?.body)

    // this method matches substrings, not whole words
    // const hasKeyword = Object.keys(courseKeywords).some((keyword) =>
    //   comment?.body?.includes(keyword)
    // )

    // if (comment?.body?.includes("Well at least")) {
    //   Object.keys(courseKeywords)?.map((keyword) => {
    //     if (comment?.body?.includes(keyword)) {
    //       console.log(comment?.body, keyword)
    //     }
    //   })
    // }

    // TODO: keyword optimization
    // console.log(hasKeyword, comment.body)

    return hasKeyword && comment?.ups > 1
  })

  filteredComments.sort((commentA, commentB) => commentB?.ups - commentA?.ups)

  return filteredComments
}
