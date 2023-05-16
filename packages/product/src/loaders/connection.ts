import { asValue } from "awilix"

import {
  InternalModuleDeclaration,
  LoaderOptions,
  MODULE_RESOURCE_TYPE,
  MODULE_SCOPE,
} from "@medusajs/modules-sdk"
import { MedusaError } from "@medusajs/utils"

import { EntitySchema } from "@mikro-orm/core"
import { MikroORM, PostgreSqlDriver } from "@mikro-orm/postgresql"

import * as ProductModels from "../models"
import {
  ProductServiceInitializeCustomDataLayerOptions,
  ProductServiceInitializeOptions,
} from "../types"

export default async (
  {
    options,
    container,
  }: LoaderOptions<
    | ProductServiceInitializeOptions
    | ProductServiceInitializeCustomDataLayerOptions
  >,
  moduleDeclaration?: InternalModuleDeclaration
): Promise<void> => {
  if (
    moduleDeclaration?.scope === MODULE_SCOPE.INTERNAL &&
    moduleDeclaration.resources === MODULE_RESOURCE_TYPE.SHARED
  ) {
    return
  }

  const customDataLayer = (
    options as ProductServiceInitializeCustomDataLayerOptions
  )?.customDataLayer
  const dbData = (options as ProductServiceInitializeOptions)?.database

  if (!customDataLayer?.manager) {
    await loadDefault({ database: dbData, container })
  } else {
    container.register({
      manager: asValue(customDataLayer.manager),
    })
  }
}

async function loadDefault({ database, container }) {
  if (!database) {
    throw new MedusaError(
      MedusaError.Types.INVALID_ARGUMENT,
      `Database config is not present at module config "options.database"`
    )
  }

  const entities = Object.values(ProductModels) as unknown as EntitySchema[]

  const orm = await MikroORM.init<PostgreSqlDriver>({
    entitiesTs: entities,
    entities: entities,
    debug: process.env.NODE_ENV === "development",
    baseDir: process.cwd(),
    clientUrl: database.clientUrl,
    schema: database.schema ?? "public",
    driverOptions: database.driverOptions ?? {
      connection: { ssl: true },
    },
    tsNode: process.env.APP_ENV === "development",
    type: "postgresql",
  })

  container.register({
    manager: asValue(orm.em.fork()),
  })
}