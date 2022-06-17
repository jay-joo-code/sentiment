import { ActionIcon, Input, Paper } from "@mantine/core"
import AddOutlinedIcon from "@mui/icons-material/AddOutlined"
import { Task } from "@prisma/client"
import Flex from "components/Flex"
import TaskItem from "components/TaskItem"
import api from "lib/api"
import React, { useState } from "react"
import useSWR from "swr"

const Todos = () => {
  const [newTaskName, setNewTaskName] = useState<string>("")
  const { data: tasks, mutate } = useSWR("/api/task")

  const createTask = async () => {
    const { data: newTask } = await api.post("/api/task", {
      name: newTaskName,
    })

    mutate((tasks) => [newTask, ...tasks], {
      revalidate: false,
    })
    setNewTaskName("")
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event?.key === "Enter") createTask()
  }

  return (
    <div>
      <Paper>
        <Flex align="stretch">
          <Input
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            style={{ flexGrow: 1 }}
            onKeyDown={handleKeyDown}
          />
          <ActionIcon
            variant="filled"
            color="blue"
            style={{ height: "34px", width: "34px" }}
          >
            <AddOutlinedIcon />
          </ActionIcon>
        </Flex>
      </Paper>
      <Paper>
        <Flex direction="column" style={{ maxWidth: "500px" }}>
          {tasks?.map((task: Task) => (
            <TaskItem key={task?.id} task={task} />
          ))}
        </Flex>
      </Paper>
    </div>
  )
}

export default Todos
