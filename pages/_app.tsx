import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { NotificationsProvider } from "@mantine/notifications"
import CustomAppShell from "components/CustomAppShell"
import SWRProvider from "components/SWRProvider"
import { SessionProvider } from "next-auth/react"
import { AppProps } from "next/app"
import Head from "next/head"
import "./../styles/reset.css"

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <SessionProvider session={pageProps.session}>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          spacing: {
            xs: 4,
            sm: 8,
            md: 12,
            lg: 16,
            xl: 20,
          },
        }}
        defaultProps={{
          Text: { component: "p" },
          Paper: {
            p: "xl",
            m: "xl",
            radius: "md",
          },
        }}
      >
        <NotificationsProvider>
          <ModalsProvider>
            <SWRProvider>
              <CustomAppShell>
                <Head>
                  <meta
                    name="viewport"
                    content="width=device-width, height=device-height, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"
                  />
                </Head>
                <Component {...pageProps} />
              </CustomAppShell>
            </SWRProvider>
          </ModalsProvider>
        </NotificationsProvider>
      </MantineProvider>
    </SessionProvider>
  )
}

export default App
