import {
  Highlight,
  SharedTextProps,
  Text,
  useMantineTheme,
} from "@mantine/core"
import useIsMobile from "hooks/isMobile"
import { useRouter } from "next/router"
import { Dispatch, SetStateAction, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { highlighter } from "util/highlighter"
import htmlDecode from "util/htmlDecode"
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
  const isMobile = useIsMobile()
  const router = useRouter()

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

  return (
    <ReactMarkdown
      components={{
        p: ({ children, ...rest }) => (
          <Text {...rest} size={isMobile ? "sm" : "md"} mb="sm">
            {children}
          </Text>
          // <Highlight
          //   {...rest}
          //   highlight={(router?.query?.query as string)?.split(" ") || ""}
          //   component="p"
          //   highlightStyles={(theme) => ({
          //     backgroundColor: theme.colors.blue[0],
          //   })}
          //   size={isMobile ? "sm" : "md"}
          //   mb="sm"
          // >
          //   {htmlDecode(children)}
          //   {/* {chunk} */}
          // </Highlight>
        ),
        strong: ({ children, ...rest }) => (
          <Text
            {...rest}
            size={isMobile ? "sm" : "md"}
            mb="sm"
            weight={500}
            component="strong"
          >
            {children}
          </Text>
          // <Highlight
          //   {...rest}
          //   highlight={(router?.query?.query as string)?.split(" ") || ""}
          //   component="strong"
          //   highlightStyles={(theme) => ({
          //     backgroundColor: theme.colors.blue[0],
          //   })}
          //   size={isMobile ? "sm" : "md"}
          //   mb="sm"
          // >
          //   {htmlDecode(children)}
          //   {/* {chunk} */}
          // </Highlight>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  )

  // return (
  //   <Text size={isMobile ? "sm" : "md"} {...rest}>
  //     {highlightChunks.map(({ chunk, highlighted }, i) => {
  //       let keyword = chunk.trim().toLowerCase()

  //       const color =
  //         courseKeywords[keyword] === 0
  //           ? theme.colors.blue[9]
  //           : courseKeywords[keyword] > 0
  //           ? theme.colors.green[9]
  //           : theme.colors.red[9]

  //       return highlighted && courseKeywords[keyword] !== 0 ? (
  //         <mark key={i} style={{ backgroundColor: "inherit", color }}>
  //           {htmlDecode(chunk)}{" "}
  //         </mark>
  //       ) : (
  //         <Highlight
  //           key={i}
  //           highlight={(router?.query?.query as string)?.split(" ") || ""}
  //           // highlight={" cs "}
  //           component="span"
  //           highlightStyles={(theme) => ({
  //             backgroundColor: theme.colors.blue[0],
  //           })}
  //           size={isMobile ? "sm" : "md"}
  //         >
  //           {/* {htmlDecode(chunk)} */}
  //           {chunk}
  //         </Highlight>
  //       )
  //     })}
  //   </Text>
  // )
}

export default CommentHighlight
