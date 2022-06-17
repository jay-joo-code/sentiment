import { showNotification } from "@mantine/notifications"
import axios from "axios"

const api = axios.create()

api.interceptors.response.use(
  (response) => response,
  (error) => {
    showNotification({
      title: "Error",
      message: error?.response?.data?.message,
      color: "red",
    })
    throw error
  }
)

export default api
