import { ActionIcon, Paper, Text, Title, Tooltip } from "@mantine/core"
import Flex from "./Flex"
import { PostProps } from "./Post"
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined"

interface IPostCardProps {
  post: PostProps
}

const PostCard = ({ post }: IPostCardProps) => {
  return (
    <Paper style={{ width: "100%" }} m="0">
      <Flex align="center" justify="space-between">
        <Title order={5}>{post?.title}</Title>
        <Tooltip label="Publish" position="bottom" transition="fade">
          <ActionIcon variant="light" color="blue">
            <UploadOutlinedIcon />
          </ActionIcon>
        </Tooltip>
      </Flex>
      <Text size="sm" color="dimmed">
        {post?.author?.name || "Unknown author"}
        {!post?.published && " • Draft"}
      </Text>
      <Text mt="md">{post?.content}</Text>
    </Paper>
  )
}

export default PostCard
