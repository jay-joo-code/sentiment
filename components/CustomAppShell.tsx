import {
  AppShell,
  Burger,
  Group,
  Header,
  MediaQuery,
  Navbar,
  Space,
  Text,
  useMantineTheme,
} from "@mantine/core"
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined"
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined"
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined"
import LibraryAddCheckOutlinedIcon from "@mui/icons-material/LibraryAddCheckOutlined"
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined"
import { getSession, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import React, { useState } from "react"
import NavItem from "./NavItem"

interface ICustomAppShellProps {
  children: React.ReactNode
}

const CustomAppShell = ({ children }: ICustomAppShellProps) => {
  const theme = useMantineTheme()
  const [opened, setOpened] = useState<boolean>(false)
  const { data: session } = useSession()

  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      fixed
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 240 }}
        >
          <Navbar.Section grow mt="md">
            <NavItem
              href="/reddit-opinions"
              icon={<ChatBubbleOutlineOutlinedIcon />}
              label="Reddit opinions"
              onClick={() => setOpened(false)}
            />
            <NavItem
              href="/todos"
              icon={<LibraryAddCheckOutlinedIcon />}
              label="Todos"
              onClick={() => setOpened(false)}
            />
            {session ? (
              <>
                <NavItem
                  href="/drafts"
                  icon={<ModeEditOutlinedIcon />}
                  label="Drafts"
                  onClick={() => setOpened(false)}
                />
                <NavItem
                  href="/create"
                  icon={<AddCircleOutlineOutlinedIcon />}
                  label="Add post"
                  onClick={() => setOpened(false)}
                />
                <NavItem
                  href="/"
                  icon={<ExitToAppOutlinedIcon />}
                  label="Sign out"
                  onClick={() => signOut()}
                />
              </>
            ) : (
              <NavItem
                href="/api/auth/signin"
                icon={<ExitToAppOutlinedIcon />}
                label="Login"
              />
            )}
          </Navbar.Section>
        </Navbar>
      }
      // aside={
      //   <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
      //     <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
      //       <Text>Application sidebar</Text>
      //     </Aside>
      //   </MediaQuery>
      // }
      // footer={
      //   <Footer height={60} p="md">
      //     Application footer
      //   </Footer>
      // }
      header={
        <Header
          height={54}
          px="lg"
          py="sm"
          style={{ display: "flex", alignItems: "center" }}
        >
          <Group spacing="sm">
            <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
              <Space pl="sm" />
            </MediaQuery>
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={() => setOpened(!opened)}
                size="sm"
                color={theme.colors.gray[6]}
              />
            </MediaQuery>

            <Link href="/">
              <Text size="xl" weight={700} color={theme.colors.blue[5]}>
                Sentiment
              </Text>
            </Link>
          </Group>
        </Header>
      }
    >
      {children}
    </AppShell>
  )
}

export default CustomAppShell
