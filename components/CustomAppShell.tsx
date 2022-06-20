import {
  AppShell,
  Box,
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
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined"
import useIsMobile from "hooks/isMobile"
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
  const isMobile = useIsMobile()
  const navbarProps = isMobile
    ? {}
    : {
        fixed: true,
        position: { top: 100, left: 80 },
        sx: (theme) => ({
          [`@media (min-width: ${theme.breakpoints.xs}px)`]: {
            borderRadius: "10px",
            height: "auto",
            minHeight: "30vh",
          },
        }),
      }

  return (
    <AppShell
      sx={(theme) => ({})}
      navbarOffsetBreakpoint="xs"
      asideOffsetBreakpoint="xs"
      // fixed
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="xs"
          hidden={!opened}
          width={{ sm: 240 }}
          {...navbarProps}
        >
          <Navbar.Section grow mt="md">
            <NavItem
              href="/"
              icon={<SearchOutlinedIcon />}
              label="Browse"
              onClick={() => setOpened(false)}
            />
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header
          height={54}
          sx={(theme) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <Group
            spacing="sm"
            // px="lg"
            py="sm"
            sx={(theme) => ({
              width: "100%",
              paddingLeft: theme.spacing.lg,
              paddingRight: theme.spacing.lg,

              [`@media (min-width: ${theme.breakpoints.xs}px)`]: {
                width: "80vw",
                paddingLeft: 0,
                paddingRight: 0,
              },
            })}
          >
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
              <Text
                size="xl"
                weight={700}
                // color={theme.colors.blue[5]}
                style={{ cursor: "pointer" }}
                variant="gradient"
                gradient={{ from: "blue", to: "cyan", deg: 45 }}
              >
                Sentiment
              </Text>
            </Link>
          </Group>
        </Header>
      }
    >
      <Box
        sx={(theme) => ({
          [`@media (min-width: ${theme.breakpoints.xs}px)`]: {
            maxWidth: "80vh",
          },
        })}
      >
        {children}
      </Box>
    </AppShell>
  )
}

export default CustomAppShell
