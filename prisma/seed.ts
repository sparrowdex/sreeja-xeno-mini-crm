const { PrismaClient } = require('@prisma/client')
const { faker } = require('@faker-js/faker')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({
  url: 'file:./prisma/dev.db',
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting seed...')

  // Clear existing data
  await prisma.communicationLog.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.segment.deleteMany()
  await prisma.order.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.campaignSuggestion.deleteMany()

  // 1. Generate 5000 Customers
  const customers = []
  const tagsPool = ['high-value', 'churn-risk', 'new-user', 'frequent-buyer', 'discount-seeker']

  for (let i = 0; i < 5000; i++) {
    const numTags = faker.number.int({ min: 0, max: 2 })
    const tags = faker.helpers.arrayElements(tagsPool, numTags)
    
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    
    customers.push({
      id: faker.string.uuid(),
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }),
      phone: faker.phone.number(),
      tags: JSON.stringify(tags),
      createdAt: faker.date.past({ years: 2 }),
    })
  }

  await prisma.customer.createMany({
    data: customers
  })

  console.log(`Created ${customers.length} customers.`)

  // 2. Generate Orders for these customers
  // Not all customers have orders. Some have many.
  const orders = []
  const orderStatuses = ['completed', 'completed', 'completed', 'completed', 'refunded', 'cancelled'] // Weight towards completed

  for (const customer of customers) {
    // 20% of users have no orders (just signed up or churned immediately)
    if (Math.random() > 0.8) continue

    const isFrequentBuyer = customer.tags.includes('frequent-buyer')
    const maxOrders = isFrequentBuyer ? 15 : 5
    const numOrders = faker.number.int({ min: 1, max: maxOrders })

    for (let j = 0; j < numOrders; j++) {
      orders.push({
        id: faker.string.uuid(),
        customerId: customer.id,
        amount: parseFloat(faker.finance.amount({ min: 10, max: 250 })),
        status: faker.helpers.arrayElement(orderStatuses),
        orderDate: faker.date.between({ from: customer.createdAt, to: new Date() }),
      })
    }
  }

  await prisma.order.createMany({
    data: orders
  })

  console.log(`Created ${orders.length} orders.`)

  console.log('Seeding complete! We now have a robust dataset for the AI to analyze.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
