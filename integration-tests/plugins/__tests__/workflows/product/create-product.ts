import { ModuleRegistrationName } from "@medusajs/modules-sdk"
import { IProductModuleService, WorkflowTypes } from "@medusajs/types"
import {
  CreateProductsActions,
  Handlers,
  createProducts,
  pipe,
} from "@medusajs/workflows"
import path from "path"
import { bootstrapApp } from "../../../../environment-helpers/bootstrap-app"
import { initDb, useDb } from "../../../../environment-helpers/use-db"

describe("CreateProduct workflow", function () {
  let medusaProcess
  let medusaContainer

  beforeAll(async () => {
    const cwd = path.resolve(path.join(__dirname, "..", "..", ".."))
    await initDb({ cwd } as any)
    const { container } = await bootstrapApp({ cwd })
    medusaContainer = container
  })

  afterAll(async () => {
    const db = useDb()
    await db.shutdown()

    medusaProcess.kill()
  })

  it("should compensate all the invoke if something fails", async () => {
    const workflow = createProducts(medusaContainer)

    workflow.appendAction(
      "fail_step",
      CreateProductsActions.attachInventoryItems,
      {
        invoke: pipe({}, async function failStep() {
          throw new Error(`Failed to create products`)
        }),
      },
      {
        noCompensation: true,
      }
    )

    const input: WorkflowTypes.ProductWorkflow.CreateProductsWorkflowInputDTO =
      {
        products: [
          {
            title: "Test product",
            type: { value: "physical" },
            tags: [{ value: "test" }],
            subtitle: "Test subtitle",
            variants: [
              {
                title: "Test variant",
                prices: [
                  {
                    amount: 100,
                    currency_code: "usd",
                  },
                ],
              },
            ],
            options: [
              {
                title: "Test option",
              },
            ],
          },
        ],
      }

    const manager = medusaContainer.resolve("manager")
    const context = {
      manager,
    }

    const { result, errors, transaction } = await workflow.run({
      input,
      context,
      throwOnError: false,
    })

    expect(errors).toEqual([
      {
        action: "fail_step",
        handlerType: "invoke",
        error: new Error(`Failed to create products`),
      },
    ])

    expect(transaction.getState()).toEqual("reverted")

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
      })
    )

    const productId = result[0].id

    let [product] = await Handlers.ProductHandlers.listProducts({
      container: medusaContainer,
      context,
      data: {
        ids: [productId],
      },
    } as any)

    expect(product).toBeUndefined()

    const productModule = medusaContainer.resolve(
      ModuleRegistrationName.PRODUCT
    ) as IProductModuleService

    ;[product] = await productModule.list(
      {
        id: productId,
      },
      {
        withDeleted: true,
      }
    )

    expect(product).toEqual(
      expect.objectContaining({
        deleted_at: expect.any(String),
      })
    )
  })
})
