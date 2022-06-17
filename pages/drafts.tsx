import React from "react"
import { GetServerSideProps } from "next"
import Layout from "../components/Layout"
import Post, { PostProps } from "../components/Post"
import { useSession, getSession } from "next-auth/react"
import prisma from "../lib/prisma"
import Flex from "components/Flex"
import PostCard from "components/PostCard"

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req })
  if (!session) {
    res.statusCode = 403
    return { props: { drafts: [] } }
  }

  const drafts = await prisma.post.findMany({
    where: {
      author: { email: session.user.email },
      published: false,
    },
    include: {
      author: {
        select: { name: true },
      },
    },
  })
  return {
    props: { drafts },
  }
}

type Props = {
  drafts: PostProps[]
}

const Drafts: React.FC<Props> = (props) => {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div>
        <h1>My Drafts</h1>
        <div>You need to be authenticated to view this page.</div>
      </div>
    )
  }

  return (
    <Flex direction="column" style={{ maxWidth: "500px" }} px="md" spacing="xl">
      {props?.drafts?.map((post) => (
        <PostCard key={post?.id} post={post} />
      ))}
    </Flex>
  )
}

export default Drafts
