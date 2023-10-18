import { PricingTypes, ProductTypes } from "@medusajs/types"

import { WorkflowArguments } from "../../helper"

type VariantPrice = {
  id?: string
  region_id?: string
  currency_code: string
  amount: number
  min_quantity?: number
  max_quantity?: number
  rules: Record<string, string>
}

type HandlerInput = {
  variantPricesMap: Map<string, VariantPrice[]>
  products: ProductTypes.ProductDTO[]
}

export async function upsertVariantPrices({
  container,
  context,
  data,
}: WorkflowArguments<HandlerInput>) {
  const { variantPricesMap } = data
  const pricingModuleService = container.resolve("pricingModuleService")
  const regionService = container.resolve("regionService")
  const medusaApp = container.resolve("medusaApp")
  const remoteQuery = container.resolve("remoteQuery")

  const variables = {
    variant_id: [...variantPricesMap.keys()],
  }

  const query = {
    product_variant_price_set: {
      __args: variables,
      fields: ["variant_id", "price_set_id"],
    },
  }

  const variantPriceSets = await remoteQuery(query)

  const variantIdToPriceSetIdMap: Map<string, string> = new Map(
    variantPriceSets.map((variantPriceSet) => [
      variantPriceSet.variant_id,
      variantPriceSet.price_set_id,
    ])
  )

  const moneyAmountsToUpdate: PricingTypes.UpdateMoneyAmountDTO[] = []
  const ruleSetPricesToAdd: PricingTypes.CreatePricesDTO[] = []
  const priceSetsToCreate: PricingTypes.CreatePriceSetDTO[] = []
  const linksToCreate: any[] = []

  for (const [variantId, prices = []] of variantPricesMap) {
    const priceSetToCreate: PricingTypes.CreatePriceSetDTO = {
      rules: [{ rule_attribute: "region_id" }],
      prices: [],
    }

    for (const price of prices) {
      if (price.id) {
        moneyAmountsToUpdate.push({
          id: price.id,
          min_quantity: price.min_quantity,
          max_quantity: price.max_quantity,
          amount: price.amount,
          currency_code: price.currency_code,
        })
      } else {
        const variantPrice: PricingTypes.CreatePricesDTO = {
          min_quantity: price.min_quantity,
          max_quantity: price.max_quantity,
          amount: price.amount,
          currency_code: price.currency_code,
          rules: {},
        }

        if (price.region_id) {
          const region = await regionService.retrieve(price.region_id)

          variantPrice.currency_code = region.currency_code
          variantPrice.rules = {
            region_id: region.id,
          }
        }

        delete price.region_id

        if (variantIdToPriceSetIdMap.get(variantId)) {
          ruleSetPricesToAdd.push(variantPrice)
        } else {
          priceSetToCreate.prices?.push(variantPrice)
        }
      }
    }

    priceSetsToCreate.push(priceSetToCreate)
    let priceSetId = variantIdToPriceSetIdMap.get(variantId)

    if (priceSetId) {
      await pricingModuleService.addPrices({
        priceSetId,
        prices: ruleSetPricesToAdd,
      })
    } else {
      priceSetId = (await pricingModuleService.create(priceSetToCreate)).id
    }

    if (moneyAmountsToUpdate.length) {
      await pricingModuleService.updateMoneyAmounts(moneyAmountsToUpdate)
    }

    linksToCreate.push({
      productService: {
        variant_id: variantId,
      },
      pricingService: {
        price_set_id: priceSetId,
      },
    })
  }

  await medusaApp.link.create(linksToCreate)
}

upsertVariantPrices.aliases = {
  products: "products",
}
