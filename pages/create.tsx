import React, { useState } from "react"
import Layout from "../components/Layout"
import Router from "next/router"
import Flex from "components/Flex"
import { Box, Button, Paper, Title } from "@mantine/core"
import Link from "next/link"

const Draft: React.FC = () => {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      const body = { title, content }
      await fetch(`/api/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      await Router.push("/drafts")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Flex justify="center">
      <Paper style={{ maxWidth: "500px" }}>
        <form onSubmit={submitData}>
          <Title order={1} mb="md">
            New post
          </Title>
          <input
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            type="text"
            value={title}
          />
          <textarea
            cols={50}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            rows={8}
            value={content}
          />
          <Flex align="center" justify="flex-end">
            <Link href="/">
              <Button variant="subtle" color="gray">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={!content || !title}>
              Create
            </Button>
          </Flex>
        </form>
      </Paper>
      <style jsx>{`
        .page {
          background: white;
          padding: 3rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        input[type="text"],
        textarea {
          width: 100%;
          padding: 0.5rem;
          margin: 0.5rem 0;
          border-radius: 0.25rem;
          border: 0.125rem solid rgba(0, 0, 0, 0.2);
        }

        input[type="submit"] {
          background: #ececec;
          border: 0;
          padding: 1rem 2rem;
        }

        .back {
          margin-left: 1rem;
        }
      `}</style>
    </Flex>
  )
}

export default Draft
