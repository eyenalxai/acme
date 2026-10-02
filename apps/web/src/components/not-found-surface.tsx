import { Button } from "@acme/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@acme/ui/components/empty"
import { Link } from "@tanstack/react-router"
import { ArrowLeftIcon, CompassIcon } from "lucide-react"

const NotFoundSurface = () => (
  <div className="mx-auto flex min-h-[60svh] w-full max-w-5xl items-center justify-center px-6 py-24">
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CompassIcon />
        </EmptyMedia>
        <EmptyTitle>Nothing lives at this address</EmptyTitle>
        <EmptyDescription>The page you asked for doesn’t exist.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button nativeButton={false} render={<Link to="/" />}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back to the start
        </Button>
      </EmptyContent>
    </Empty>
  </div>
)

export { NotFoundSurface }
