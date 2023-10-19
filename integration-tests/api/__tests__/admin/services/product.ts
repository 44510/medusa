import path from "path"
import { initDb, useDb } from "../../../../environment-helpers/use-db"
import { bootstrapApp } from "../../../../environment-helpers/bootstrap-app"

jest.setTimeout(30000)

describe("/admin/products", () => {
  let medusaProcess
  let dbConnection
  let medusaContainer
  let productService

  beforeAll(async () => {
    const cwd = path.resolve(path.join(__dirname, "..", "..", ".."))
    dbConnection = await initDb({ cwd } as any)
    const { container } = await bootstrapApp({ cwd })
    medusaContainer = container
    productService = medusaContainer.resolve("productService")
  })

  afterAll(async () => {
    const db = useDb()
    await db.shutdown()

    medusaProcess.kill()
  })

  afterEach(async () => {
    const db = useDb()
    await db.teardown()
  })


  it("should create variant prices correctly in service creation", async () => {
    const payload = {
      title: "test-product",
      handle: "test-product",
      options: [{ title: "test-option" }],
      variants: [
        {
          title: "test-variant",
          inventory_quantity: 10,
          sku: "test",
          options: [{ value: "large", title: "test-option" }],
          prices: [{ amount: "100", currency_code: "usd" }],
        },
      ],
    }

    const { id } = await productService.create(payload)

    const result = await productService.retrieve(id, {
      relations: ["variants", "variants.prices", "variants.options"],
    })

    expect(result).toEqual(
      expect.objectContaining({
        variants: [
          expect.objectContaining({
            options: [expect.objectContaining({ value: "large" })],
            prices: [
              expect.objectContaining({ amount: 100, currency_code: "usd" }),
            ],
          }),
        ],
      })
    )
  })

  it("should fail to create a variant without options on for a product with options", async () => {
    const payload = {
      title: "test-product",
      handle: "test-product",
      options: [{ title: "test-option" }],
      variants: [
        {
          title: "test-variant",
          inventory_quantity: 10,
          sku: "test",
          prices: [{ amount: "100", currency_code: "usd" }],
        },
      ],
    }

    let error

    try { 
      await productService.create(payload)
    } catch(err) { 
      error = err
    }

    expect(error.message).toEqual(
      "Product options length does not match variant options length. Product has 1 and variant has 0."
    )
  })

  it("should create a product and variant without options", async () => {
    const payload = {
      title: "test-product",
      handle: "test-product",
      variants: [
        {
          title: "test-variant",
          inventory_quantity: 10,
          sku: "test",
          prices: [{ amount: "100", currency_code: "usd" }],
        },
      ],
    }

    const { id } = await productService.create(payload)

    const result = await productService.retrieve(id, {
      relations: ["variants", "variants.prices", "variants.options"],
    })

    expect(result).toEqual(
      expect.objectContaining({
        options: [], 
        variants: [
          expect.objectContaining({
            prices: [
              expect.objectContaining({ amount: 100, currency_code: "usd" }),
            ],
          }),
        ],
      })
    )
  })
})