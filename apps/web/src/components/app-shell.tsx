import type { ReactNode } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acme/ui/components/dropdown-menu"
import { Separator } from "@acme/ui/components/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@acme/ui/components/sidebar"
import { Spinner } from "@acme/ui/components/spinner"
import { Link } from "@tanstack/react-router"
import { ChevronsUpDownIcon, HouseIcon, LogOutIcon, StickyNoteIcon } from "lucide-react"
import { useState } from "react"

type AppShellUser = {
  name: string
  email: string
  image: string | null
}

type AppShellProps = {
  user: AppShellUser
  defaultOpen: boolean
  onSignOut: () => Promise<void>
  children: ReactNode
}

const initialsOf = (name: string) => {
  const initials = name
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("")

  return initials || "?"
}

const UserIdentity = ({ user }: { user: AppShellUser }) => (
  <>
    <Avatar>
      {user.image === null || user.image === "" ? null : <AvatarImage src={user.image} alt="" />}
      <AvatarFallback>{initialsOf(user.name)}</AvatarFallback>
    </Avatar>
    <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
      <span className="truncate font-medium">{user.name}</span>
      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
    </div>
  </>
)

const AccountMenu = ({
  user,
  onSignOut,
}: {
  user: AppShellUser
  onSignOut: () => Promise<void>
}) => {
  const [signingOut, setSigningOut] = useState(false)
  const [signOutFailed, setSignOutFailed] = useState(false)

  const signOut = async () => {
    setSigningOut(true)
    setSignOutFailed(false)

    try {
      await onSignOut()
    } catch {
      setSignOutFailed(true)
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
          />
        }
      >
        <UserIdentity user={user} />
        <ChevronsUpDownIcon className="ms-auto" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5">
              <UserIdentity user={user} />
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            closeOnClick={false}
            disabled={signingOut}
            onClick={() => {
              void signOut()
            }}
          >
            {signingOut ? <Spinner /> : <LogOutIcon />}
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {signOutFailed ? (
          <p role="status" className="px-1.5 py-1 text-xs text-destructive">
            Couldn’t sign out. Try again.
          </p>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const AppShell = ({ user, defaultOpen, onSignOut, children }: AppShellProps) => (
  <SidebarProvider defaultOpen={defaultOpen}>
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex h-12 items-center px-2">
          <span className="truncate text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Acme
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link to="/app" />}>
                  <HouseIcon />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link to="/app/notes" />}>
                  <StickyNoteIcon />
                  <span>Notes</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <AccountMenu user={user} onSignOut={onSignOut} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ms-1" />
        <Separator orientation="vertical" className="h-4" />
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </SidebarInset>
  </SidebarProvider>
)

export { AppShell }
