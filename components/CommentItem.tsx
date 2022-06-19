import {
  Badge,
  Box,
  Highlight,
  Spoiler,
  Text,
  useMantineTheme,
} from "@mantine/core"
import useIsMobile from "hooks/isMobile"
import moment from "moment"
import { useRouter } from "next/router"
import { useState } from "react"
import htmlDecode from "util/htmlDecode"
import { IRedditComment } from "util/reddit"
import CommentHighlight from "./CommentHighlight"
import ArrowRightOutlinedIcon from "@mui/icons-material/ArrowRightOutlined"
import Flex from "./Flex"
import { RedditComment } from "@prisma/client"

interface ICommentItemProps {
  comment: RedditComment
}

const CommentItem = ({ comment }: ICommentItemProps) => {
  const [sentiment, setSentiment] = useState<number>(0)
  const theme = useMantineTheme()
  const isMobile = useIsMobile()
  const router = useRouter()

  const signedNumber = (n: string): string => {
    return (Number(n) <= 0 ? "" : "+") + n
  }

  const absoluteSentiment = signedNumber(
    (comment?.sentimentScore * comment?.sentimentMagnitude)?.toFixed(2)
  )

  const totalSentiment =
    comment?.sentimentScore === 0
      ? "Neutral"
      : signedNumber(
          (
            comment?.sentimentScore *
            comment?.sentimentMagnitude *
            comment?.ups
          ).toFixed(2)
        )

  const sentimentColor =
    comment?.sentimentScore === 0
      ? "gray"
      : comment?.sentimentScore < 0
      ? "red"
      : "green"

  return (
    <Box
      // mt="xl"
      py="lg"
      px="sm"
      // mb="md"
      sx={(theme) => ({ borderBottom: `1px solid ${theme.colors.gray[2]}` })}
    >
      {comment?.responseTo && (
        <Highlight
          highlight={(router?.query?.query as string)?.split(" ") || ""}
          highlightStyles={(theme) => ({
            backgroundColor: theme.colors.blue[0],
          })}
          size={isMobile ? "xs" : "sm"}
          color="dimmed"
          sx={() => ({
            // whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          })}
          my="sm"
        >
          {`Re: ${htmlDecode(comment?.responseTo)}`}
          {/* <a
          href={`https://www.reddit.com${comment?.permalink}`}
          style={{ color: theme.colors.gray[6] }}
          target="_blank"
          rel="noreferrer"
        >
        </a> */}
        </Highlight>
      )}
      <Spoiler
        maxHeight={isMobile ? 110 : 128}
        showLabel="Read more"
        hideLabel="Read less"
        sx={(theme) => ({
          "& button": {
            fontSize: theme.fontSizes.xs,
          },
        })}
        mb="md"
      >
        <CommentHighlight setSentiment={setSentiment}>
          {comment?.body}
        </CommentHighlight>
      </Spoiler>

      <Flex align="center" spacing="sm">
        <Badge size="sm" color={sentimentColor}>
          {totalSentiment}
        </Badge>

        <Text size="xs" color="dimmed">
          {comment?.ups} upvotes • {moment(comment?.createdAt).fromNow()} •{" "}
          <a
            href={`https://www.reddit.com${comment?.permalink}`}
            style={{ color: theme.colors.gray[6] }}
            target="_blank"
            rel="noreferrer"
          >
            Go to comment
          </a>
        </Text>
      </Flex>
    </Box>
  )
}

export default CommentItem
