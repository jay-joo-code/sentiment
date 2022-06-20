import { Text } from "@mantine/core"
import useIsMobile from "hooks/isMobile"
import ReactMarkdown from "react-markdown"

interface ICommentHighlightProps {
  children: string
}

const CommentHighlight = ({ children }: ICommentHighlightProps) => {
  const isMobile = useIsMobile()

  return (
    <ReactMarkdown
      components={{
        p: ({ children, ...rest }) => (
          <Text {...rest} size={isMobile ? "sm" : "md"} mb="sm">
            {children}
          </Text>
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
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

export default CommentHighlight
