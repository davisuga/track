import { afterAll, describe, expect, it } from "vitest"

import { getStoredImageReference } from "@/lib/r2"

const seededUserId = "22222222-2222-2222-2222-222222222221"
const seededCompanyId = "11111111-1111-1111-1111-111111111111"

type GraphQlResponse<T> = {
  data?: T
  errors?: Array<{ message?: string }>
}

const createdCompanyIds: string[] = []
const createdReceiptItemIds: string[] = []
const createdReceiptIds: string[] = []

async function postGraphQl<TData>(
  query: string,
  variables?: Record<string, unknown>
): Promise<TData> {
  const graphqlUrl = process.env.GRAPHQL_URL

  if (!graphqlUrl) {
    throw new Error("GRAPHQL_URL is missing for integration tests.")
  }

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      ...(process.env.GRAPHQL_AUTH_TOKEN
        ? { Authorization: `Bearer ${process.env.GRAPHQL_AUTH_TOKEN}` }
        : {}),
      Accept: "application/graphql-response+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed with status ${response.status}.`)
  }

  const payload = (await response.json()) as GraphQlResponse<TData>

  if (payload.errors?.length) {
    throw new Error(
      payload.errors
        .map((error) => error.message)
        .filter(Boolean)
        .join("\n") || "GraphQL returned an unknown error."
    )
  }

  if (!payload.data) {
    throw new Error("GraphQL did not return data.")
  }

  return payload.data
}

afterAll(async () => {
  while (createdReceiptItemIds.length) {
    await postGraphQl(
      `
        mutation DeleteReceiptItem($id: Uuid!) {
          deleteReceiptItemsById(keyId: $id) {
            affectedRows
          }
        }
      `,
      { id: createdReceiptItemIds.pop() }
    )
  }

  while (createdReceiptIds.length) {
    await postGraphQl(
      `
        mutation DeleteReceipt($id: Uuid!) {
          deleteReceiptsById(keyId: $id) {
            affectedRows
          }
        }
      `,
      { id: createdReceiptIds.pop() }
    )
  }

  while (createdCompanyIds.length) {
    await postGraphQl(
      `
        mutation DeleteCompany($id: Uuid!) {
          deleteCompaniesById(keyId: $id) {
            affectedRows
          }
        }
      `,
      { id: createdCompanyIds.pop() }
    )
  }
})

describe("dashboard GraphQL integration", () => {
  it("exposes policy models and vendor tax receipt fields through the dashboard queries", async () => {
    const companyName = `Dashboard Policy Test ${Date.now()}`
    const vendorName = `Dashboard Receipt Test ${Date.now()}`
    const imageReference = getStoredImageReference(
      `receipts/${seededUserId}/dashboard-graphql-test.jpg`
    )

    const insertedCompany = await postGraphQl<{
      insertCompanies: {
        returning: Array<{
          id: string
          name: string
        }>
      }
    }>(
      `
          mutation InsertDashboardCompany($objects: [InsertCompaniesObjectInput!]!) {
            insertCompanies(objects: $objects) {
              returning {
                id
                name
              }
            }
          }
        `,
      {
        objects: [{ name: companyName }],
      }
    )

    const company = insertedCompany.insertCompanies.returning[0]
    expect(company).toBeDefined()
    createdCompanyIds.push(company!.id)

    const insertedPolicy = await postGraphQl<{
      insertCategorySpendLimits: {
        returning: Array<{
          category: string
          companyId: string
          id: string
          maxReceiptAmount: string
        }>
      }
    }>(
      `
          mutation InsertDashboardPolicy($objects: [InsertCategorySpendLimitsObjectInput!]!) {
            insertCategorySpendLimits(objects: $objects) {
              returning {
                id
                category
                companyId
                maxReceiptAmount
              }
            }
          }
        `,
      {
        objects: [
          {
            category: "food",
            companyId: company!.id,
            maxReceiptAmount: "88.00",
          },
        ],
      }
    )

    const policy = insertedPolicy.insertCategorySpendLimits.returning[0]
    expect(policy).toMatchObject({
      category: "food",
      companyId: company?.id,
      maxReceiptAmount: "88.00",
    })

    const updatedPolicy = await postGraphQl<{
      updateCategorySpendLimitsById: {
        returning: Array<{
          category: string
          companyId: string
          id: string
          maxReceiptAmount: string
        }>
      }
    }>(
      `
          mutation UpdateDashboardPolicy($keyId: Uuid!, $updateColumns: UpdateCategorySpendLimitsByIdUpdateColumnsInput!) {
            updateCategorySpendLimitsById(keyId: $keyId, updateColumns: $updateColumns) {
              returning {
                id
                category
                companyId
                maxReceiptAmount
              }
            }
          }
        `,
      {
        keyId: policy?.id,
        updateColumns: {
          maxReceiptAmount: {
            set: "95.00",
          },
        },
      }
    )

    expect(
      updatedPolicy.updateCategorySpendLimitsById.returning[0]
    ).toMatchObject({
      id: policy?.id,
      maxReceiptAmount: "95.00",
    })

    const insertedReceipt = await postGraphQl<{
      insertReceipts: {
        returning: Array<{
          id: string
          imageUrl: string | null
          receiptDate: string
          totalAmount: string
          vendorName: string
          vendorTaxId: string | null
          vendorTaxIdValid: boolean
        }>
      }
    }>(
      `
          mutation InsertDashboardReceipt($objects: [InsertReceiptsObjectInput!]!) {
            insertReceipts(objects: $objects) {
              returning {
                id
                imageUrl
                receiptDate
                totalAmount
                vendorName
                vendorTaxId
                vendorTaxIdValid
              }
            }
          }
        `,
      {
        objects: [
          {
            companyId: seededCompanyId,
            imageUrl: imageReference,
            receiptDate: "2026-03-14",
            status: "extracted",
            totalAmount: "42.50",
            userId: seededUserId,
            vendorName,
            vendorTaxId: "11444777000161",
            vendorTaxIdValid: true,
          },
        ],
      }
    )

    const receipt = insertedReceipt.insertReceipts.returning[0]
    expect(receipt).toMatchObject({
      imageUrl: imageReference,
      receiptDate: "2026-03-14",
      totalAmount: "42.50",
      vendorName,
      vendorTaxId: "11444777000161",
      vendorTaxIdValid: true,
    })
    createdReceiptIds.push(receipt!.id)

    const insertedItem = await postGraphQl<{
      insertReceiptItems: {
        returning: Array<{
          description: string
          id: string
          totalPrice: string
        }>
      }
    }>(
      `
          mutation InsertDashboardReceiptItems($objects: [InsertReceiptItemsObjectInput!]!) {
            insertReceiptItems(objects: $objects) {
              returning {
                id
                description
                totalPrice
              }
            }
          }
        `,
      {
        objects: [
          {
            category: "Office Supplies",
            description: "Printer Paper",
            quantity: "2.00",
            receiptId: receipt!.id,
            totalPrice: "42.50",
            unitPrice: "21.25",
          },
        ],
      }
    )

    createdReceiptItemIds.push(insertedItem.insertReceiptItems.returning[0]!.id)

    const dashboardBootstrap = await postGraphQl<{
      categorySpendLimits: Array<{
        category: string
        companyId: string
        id: string
        maxReceiptAmount: string
      }> | null
      receipts: Array<{
        id: string
        receiptDate: string
        totalAmount: string
        vendorName: string
        vendorTaxId: string | null
        vendorTaxIdValid: boolean
        receiptItems: Array<{
          description: string
          totalPrice: string
        }> | null
      }> | null
      users: Array<{
        companyId: string
        fullName: string
        id: string
      }> | null
    }>(
      `
          query DashboardBootstrap {
            users(order_by: [{ fullName: Asc }]) {
              id
              companyId
              fullName
            }
            categorySpendLimits(order_by: [{ category: Asc }]) {
              id
              category
              companyId
              maxReceiptAmount
            }
            receipts(order_by: [{ receiptDate: Desc }, { createdAt: Desc }]) {
              id
              receiptDate
              totalAmount
              vendorName
              vendorTaxId
              vendorTaxIdValid
              receiptItems(order_by: [{ totalPrice: Desc }, { description: Asc }]) {
                description
                totalPrice
              }
            }
          }
        `
    )

    expect(
      dashboardBootstrap.users?.some((user) => user.id === seededUserId)
    ).toBe(true)
    expect(
      dashboardBootstrap.categorySpendLimits?.find(
        (entry) => entry.id === policy?.id
      )
    ).toMatchObject({
      category: "food",
      companyId: company?.id,
      maxReceiptAmount: "95.00",
    })
    expect(
      dashboardBootstrap.receipts?.find((entry) => entry.id === receipt?.id)
    ).toMatchObject({
      receiptDate: "2026-03-14",
      totalAmount: "42.50",
      vendorName,
      vendorTaxId: "11444777000161",
      vendorTaxIdValid: true,
      receiptItems: [{ description: "Printer Paper", totalPrice: "42.50" }],
    })

    const receiptDetail = await postGraphQl<{
      receiptsById: {
        id: string
        receiptDate: string
        totalAmount: string
        vendorName: string
        vendorTaxId: string | null
        vendorTaxIdValid: boolean
        receiptItems: Array<{
          description: string
          totalPrice: string
        }> | null
      } | null
    }>(
      `
          query DashboardReceiptDetail($id: Uuid!) {
            receiptsById(id: $id) {
              id
              receiptDate
              totalAmount
              vendorName
              vendorTaxId
              vendorTaxIdValid
              receiptItems(order_by: [{ totalPrice: Desc }, { description: Asc }]) {
                description
                totalPrice
              }
            }
          }
        `,
      { id: receipt!.id }
    )

    expect(receiptDetail.receiptsById).toMatchObject({
      id: receipt?.id,
      receiptDate: "2026-03-14",
      totalAmount: "42.50",
      vendorName,
      vendorTaxId: "11444777000161",
      vendorTaxIdValid: true,
    })
    expect(receiptDetail.receiptsById?.receiptItems).toEqual([
      { description: "Printer Paper", totalPrice: "42.50" },
    ])
  }, 20_000)
})
