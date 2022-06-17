import { Button } from "@mantine/core"
import React from "react"

const TestSentry = () => {
  return (
    <Button
      onClick={() => {
        throw new Error("Client side test error")
      }}
    >
      Create error
    </Button>
  )
}

export default TestSentry
