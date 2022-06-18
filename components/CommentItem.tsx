import { Box, Highlight, Spoiler, Text, useMantineTheme } from "@mantine/core"
import useIsMobile from "hooks/isMobile"
import moment from "moment"
import { useRouter } from "next/router"
import { useState } from "react"
import htmlDecode from "util/htmlDecode"
import { IRedditComment } from "util/reddit"
import CommentHighlight from "./CommentHighlight"
import ArrowRightOutlinedIcon from "@mui/icons-material/ArrowRightOutlined"
import Flex from "./Flex"

interface ICommentItemProps {
  comment: IRedditComment
}

const CommentItem = ({ comment }: ICommentItemProps) => {
  const [sentiment, setSentiment] = useState<number>(0)
  const date = new Date(0)
  date.setUTCSeconds(Number(comment?.createdAt))
  const theme = useMantineTheme()
  const isMobile = useIsMobile()
  const router = useRouter()

  return (
    <Box
      // mt="xl"
      py="md"
      px="sm"
      mb="md"
      sx={(theme) => ({ borderBottom: `1px solid ${theme.colors.gray[2]}` })}
    >
      <Highlight
        highlight={(router?.query?.query as string)?.split(" ") || ""}
        highlightStyles={(theme) => ({
          backgroundColor: theme.colors.blue[1],
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
      >
        {htmlDecode(comment?.responseTo)}
        {/* <a
          href={`https://www.reddit.com${comment?.permalink}`}
          style={{ color: theme.colors.gray[6] }}
          target="_blank"
          rel="noreferrer"
        >
        </a> */}
      </Highlight>
      <Spoiler
        maxHeight={isMobile ? 110 : 128}
        showLabel="Read more"
        hideLabel="Read less"
        sx={(theme) => ({
          "& button": {
            fontSize: theme.fontSizes.xs,
          },
        })}
        my="md"
      >
        <CommentHighlight setSentiment={setSentiment}>
          {comment?.body}
        </CommentHighlight>
      </Spoiler>
      <Text size="xs" color="dimmed">
        {/* <Mark
          sx={(theme) => ({
            color: sentiment < 0 ? theme.colors.red[9] : theme.colors.green[9],
            backgroundColor: "inherit",
          })}
        >
          {sentiment * comment?.ups} sentiment
        </Mark>{" "}
        •  */}
        {comment?.ups} upvotes • {moment(date).fromNow()} •{" "}
        <a
          href={`https://www.reddit.com${comment?.permalink}`}
          style={{ color: theme.colors.gray[6] }}
          target="_blank"
          rel="noreferrer"
        >
          Go to comment
        </a>
      </Text>
    </Box>
  )
}

export default CommentItem
