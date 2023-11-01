const { MongoClient } = require("mongodb");

// Replace the URI string with your connection string.
const uri = "<Your MongoDB URI>";
const client = new MongoClient(uri);

async function run() {
  try {
    // Drop any collections from a previous run
    await client.db("sample_joins").dropCollection("products");
    await client.db("sample_joins").dropCollection("orders");

    const joinDatabase = client.db("sample_joins");
    const products = await joinDatabase.collection("products");
    const orders = await joinDatabase.collection("orders");

    
    products.createIndex({ id: 1 });
    const productDocuments = [
      // start-products
      {
        id: "a1b2c3d4",
        name: "Asus Laptop",
        category: "ELECTRONICS",
        description: "Good value laptop for students",
      },
      {
        id: "z9y8x7w6",
        name: "The Day Of The Triffids",
        category: "BOOKS",
        description: "Classic post-apocalyptic novel",
      },
      {
        id: "ff11gg22hh33",
        name: "Morphy Richardds Food Mixer",
        category: "KITCHENWARE",
        description: "Luxury mixer turning good cakes into great",
      },
      {
        id: "pqr678st",
        name: "Karcher Hose Set",
        category: "GARDEN",
        description: "Hose + nosels + winder for tidy storage",
      },
      // end-products
    ];

    await products.insertMany(productDocuments);
    

    orders.createIndex({ orderdate: -1 });

    const orderDocuments = [
      // start-orders
      {
        customer_id: "elise_smith@myemail.com",
        orderdate: new Date("2020-05-30T08:35:52Z"),
        product_id: "a1b2c3d4",
        value: 431.43,
      },
      {
        customer_id: "tj@wheresmyemail.com",
        orderdate: new Date("2019-05-28T19:13:32Z"),
        product_id: "z9y8x7w6",
        value: 5.01,
      },
      {
        customer_id: "oranieri@warmmail.com",
        orderdate: new Date("2020-01-01T08:25:37Z"),
        product_id: "ff11gg22hh33",
        value: 63.13,
      },
      {
        customer_id: "jjones@tepidmail.com",
        orderdate: new Date("2020-12-26T08:55:46Z"),
        product_id: "a1b2c3d4",
        value: 429.65,
      },
      // end-orders
    ];

    await orders.insertMany(orderDocuments);
    

    // start-match
    const pipeline = [];

    pipeline.push({
      $match: {
        orderdate: {
          $gte: new Date("2020-01-01T00:00:00Z"),
          $lt: new Date("2021-01-01T00:00:00Z"),
        },
      },
    });
    // end-match

    // start-lookup
    pipeline.push({
      $lookup: {
        from: "products",
        localField: "product_id",
        foreignField: "id",
        as: "product_mapping",
      },
    });
    // end-lookup

    // start-set
    pipeline.push(
        {
          $set: {
            product_mapping: { $first: "$product_mapping" },
          },
        },
        {
          $set: {
            product_name: "$product_mapping.name",
            product_category: "$product_mapping.category",
          },
        }
      );``
    // end-set

    // start-unset
    pipeline.push({ $unset: ["_id", "product_id", "product_mapping"] });
    // end-unset

    // start-run-aggregation
    const aggregationResult = await orders.aggregate(pipeline);

    for await (const document of aggregationResult) {
      console.log(document);
    }
    // end-run-aggregation
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
