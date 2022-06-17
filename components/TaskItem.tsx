import { Checkbox, Text } from "@mantine/core"
import { Task } from "@prisma/client"
import api from "lib/api"
import { useSWRConfig } from "swr"
import Flex from "./Flex"

interface ITaskItemProps {
  task: Task
}

const TaskItem = ({ task }: ITaskItemProps) => {
  const { mutate } = useSWRConfig()

  const handleChange = async () => {
    mutate(
      "/api/task",
      (prevTasks) => {
        const newTasks = prevTasks?.map((prevTask) => {
          if (prevTask?.id === task?.id) {
            return {
              ...prevTask,
              isComplete: !prevTask?.isComplete,
            }
          }
          return prevTask
        })
        return newTasks
      },
      {
        revalidate: false,
      }
    )
    api.put(`/api/task/${task?.id}`, {
      isComplete: !task?.isComplete,
    })
  }

  return (
    <Flex align="center">
      <Checkbox checked={task?.isComplete} onChange={handleChange} />
      <Text>{task?.name}</Text>
    </Flex>
  )
}

export default TaskItem
