import type { ErrorComponentProps } from "@tanstack/react-router"

import { Button } from "@acme/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@acme/ui/components/empty"
import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react"

const describeError = (error: unknown): string =>
  error instanceof Error
    ? error.message
    : typeof error === "string"
      ? error
      : "The page failed without leaving a message."

const ErrorSurface = ({ error, reset }: ErrorComponentProps) => (
  <div className="mx-auto flex min-h-[60svh] w-full max-w-5xl items-center justify-center px-6 py-24">
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>This page stopped rendering</EmptyTitle>
        <EmptyDescription>{describeError(error)}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={reset}>
          <RotateCcwIcon data-icon="inline-start" />
          Try again
        </Button>
      </EmptyContent>
    </Empty>
  </div>
)

export { ErrorSurface }
