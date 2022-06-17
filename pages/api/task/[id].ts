import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import prisma from "../../../lib/prisma"

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })

  if (!session) {
    res.status(401).send({ message: "Unauthorized" })
    return
  }

  switch (req.method) {
    case "PUT":
      console.log("req?.body", req?.body)
      const result = await prisma.task.update({
        where: { id: Number(req?.query?.id) },
        data: req?.body,
      })
      res.json(result)
      break

    default:
      break
  }
}
