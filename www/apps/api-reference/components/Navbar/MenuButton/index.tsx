"use client"

import NavbarIconButton, { NavbarIconButtonProps } from "../IconButton"
import { useSidebar } from "@/providers/sidebar"
import clsx from "clsx"
import { usePageLoading } from "docs-ui"
import { Sidebar, XMark } from "@medusajs/icons"

type NavbarMenuButtonProps = {
  buttonProps?: NavbarIconButtonProps
}

const NavbarMenuButton = ({ buttonProps }: NavbarMenuButtonProps) => {
  const { setMobileSidebarOpen, mobileSidebarOpen } = useSidebar()
  const { isLoading } = usePageLoading()

  return (
    <NavbarIconButton
      {...buttonProps}
      className={clsx("mr-1 lg:!hidden", buttonProps?.className)}
      onClick={() => {
        if (!isLoading) {
          setMobileSidebarOpen((prevValue) => !prevValue)
        }
      }}
    >
      {!mobileSidebarOpen && (
        <Sidebar className="text-medusa-fg-muted dark:text-medusa-fg-muted-dark" />
      )}
      {mobileSidebarOpen && (
        <XMark className="text-medusa-fg-muted dark:text-medusa-fg-muted-dark" />
      )}
    </NavbarIconButton>
  )
}

export default NavbarMenuButton