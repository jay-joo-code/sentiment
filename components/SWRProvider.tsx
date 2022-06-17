import { showNotification } from "@mantine/notifications"
import React from "react"
import { SWRConfig } from "swr"

interface ISWRProviderProps {
  children: React.ReactNode
}

const SWRProvider = ({ children }: ISWRProviderProps) => {
  // function NetworkException({ message, status }) {
  //   this.status = status
  //   this.message = message
  // }

  return (
    <SWRConfig
      value={{
        fetcher: async (url) => {
          const res = await fetch(url)
          if (!res.ok) {
            const errorInfo = await res.json()

            showNotification({
              title: "Error",
              message: errorInfo.message,
              color: "red",
            })

            return
          }

          return res.json()
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}

export default SWRProvider
