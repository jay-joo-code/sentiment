import { Group, GroupProps } from "@mantine/core"
import React from "react"

interface IFlexProps extends GroupProps {
  justify?: React.CSSProperties["alignItems"]
}

const Flex = ({ justify, grow, ...rest }: IFlexProps) => {
  return (
    <Group
      {...rest}
      sx={() => ({
        justifyContent: justify,
        flexGrow: grow ? 1 : 0,
      })}
    />
  )
}

export default Flex
