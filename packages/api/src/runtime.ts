import { Layer, ManagedRuntime } from "effect"

import { LoggingLayer } from "#logging"

type ApiRuntime<Services, RuntimeError = never> = ManagedRuntime.ManagedRuntime<
  Services,
  RuntimeError
>

const createApiRuntime = <Services, LayerError>(
  layer: Layer.Layer<Services, LayerError>,
): ApiRuntime<Services, LayerError> => ManagedRuntime.make(Layer.merge(layer, LoggingLayer))

export { createApiRuntime }
export type { ApiRuntime }
