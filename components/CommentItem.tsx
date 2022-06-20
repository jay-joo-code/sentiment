import {
  Badge,
  Box,
  Highlight,
  Popover,
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
  const [isPopoverOpened, setIsPopoverOpened] = useState(false)

  const signedNumber = (n: string): string => {
    return (Number(n) <= 0 ? "" : "+") + n
  }

  const absoluteSentiment = signedNumber(
    (comment?.sentimentScore * comment?.sentimentMagnitude)?.toFixed(2)
  )

  const totalSentimentString =
    comment?.sentimentScore === 0
      ? "Neutral"
      : `${signedNumber(
          (
            comment?.sentimentScore *
            comment?.sentimentMagnitude *
            comment?.ups
          ).toFixed(0)
        )} sentiment`

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
        <Text
          size={isMobile ? "xs" : "sm"}
          color="dimmed"
          my="sm"
          sx={() => ({
            // whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          })}
        >
          {`Re: ${htmlDecode(comment?.responseTo)}`}
        </Text>
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
        mb="lg"
      >
        <CommentHighlight setSentiment={setSentiment}>
          {comment?.body}
        </CommentHighlight>
      </Spoiler>

      <Flex align="center" spacing="sm">
        <Popover
          opened={isPopoverOpened}
          onClose={() => setIsPopoverOpened(false)}
          position="bottom"
          placement="start"
          // transition="slide-down"
          withArrow={false}
          trapFocus={false}
          closeOnEscape={false}
          width={260}
          styles={{ body: { pointerEvents: "none" } }}
          target={
            <Badge
              size="sm"
              color={sentimentColor}
              style={{ marginLeft: "-4px" }}
              onMouseEnter={() => setIsPopoverOpened(true)}
              onMouseLeave={() => setIsPopoverOpened(false)}
            >
              {totalSentimentString}
            </Badge>
          }
        >
          <div>
            <Text size="xs" color="dimmed">
              <Text size="xs" component="span" color={sentimentColor}>
                {absoluteSentiment}
              </Text>{" "}
              text sentiment x{" "}
              <Text size="xs" component="span" color="dark">
                {comment?.ups}
              </Text>{" "}
              upvotes
            </Text>
          </div>
        </Popover>

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
      {/* <Text size="xs" color="dimmed" mt="md">
        {comment?.sentimentScore} score • {comment?.sentimentMagnitude} mag
      </Text> */}
    </Box>
  )
}

export default CommentItem
