import {
  CSSObject,
  HighlightProps,
  MantineColor,
  MantineTheme,
  Mark,
  SharedTextProps,
  Text,
  useMantineTheme,
} from "@mantine/core"
import useIsMobile from "hooks/isMobile"
import React, { Dispatch, SetStateAction, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { highlighter, IHighlightConfig } from "util/highlighter"
import { courseKeywords } from "util/redditKeywords"

interface ICommentHighlightProps extends SharedTextProps {
  /** Full string part of which will be highlighted */
  children: string
  setSentiment: Dispatch<SetStateAction<number>>
}

const CommentHighlight = ({
  children,
  setSentiment,
  ...rest
}: ICommentHighlightProps) => {
  const highlightChunks = highlighter(children, Object.keys(courseKeywords))
  const theme = useMantineTheme()

  useEffect(() => {
    let sentiment = 0

    highlightChunks?.map(({ chunk }) => {
      let keyword = chunk.trim().toLowerCase()

      if (Object.keys(courseKeywords).includes(keyword)) {
        sentiment += courseKeywords[keyword]
      }
    })
    setSentiment(sentiment)
  }, [highlightChunks])

  function htmlDecode(input) {
    var doc = new DOMParser().parseFromString(input, "text/html")
    return doc.documentElement.textContent
  }

  const isMobile = useIsMobile()

  return (
    <Text size={isMobile ? "sm" : "md"} {...rest}>
      {highlightChunks.map(({ chunk, highlighted }, i) => {
        let keyword = chunk.trim().toLowerCase()

        const color =
          courseKeywords[keyword] === 0
            ? theme.colors.blue[9]
            : courseKeywords[keyword] > 0
            ? theme.colors.green[9]
            : theme.colors.red[9]

        return highlighted && courseKeywords[keyword] !== 0 ? (
          <mark key={i} style={{ backgroundColor: "inherit", color }}>
            {htmlDecode(chunk)}{" "}
          </mark>
        ) : (
          <span key={i}>{htmlDecode(chunk)}</span>
        )
      })}
    </Text>
  )
}

export default CommentHighlight
