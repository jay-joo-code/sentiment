import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../../lib/prisma"
import { getSession } from "next-auth/react"
import { withSentry } from "@sentry/nextjs"

async function handle(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })

  if (!session) {
    res.status(401).send({ message: "Unauthorized" })
    return
  }

  switch (req.method) {
    case "GET":
      const tasks = await prisma.task.findMany({
        where: {
          user: { email: session.user.email },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
      res.json(tasks)
      break

    case "POST":
      if (!req.body?.name || req.body?.name?.length === 0) {
        res
          .status(400)
          .send({ message: "Enter the task name to create a task" })
        return
      }

      const task = await prisma.task.create({
        data: {
          name: req.body?.name,
          user: { connect: { email: session?.user?.email } },
        },
      })
      res.json(task)
      break

    default:
      break
  }
}

export default withSentry(handle)
