import Flex from "components/Flex"
import RedditQueryInput from "components/RedditQueryInput"
import RedditSentiment from "components/RedditSentiment"

const RedditOpinions = () => {
  return (
    <Flex direction="column" align="stretch" spacing="xs" px="sm">
      <RedditQueryInput />
      <RedditSentiment />
    </Flex>
  )
}

export default RedditOpinions
