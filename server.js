import express from "express";
import pg from "pg"

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  password: "3495",
  host: "localhost",  
  port: 5432,
  database: "3330-hw-7",  
});

db.connect();

app.use(express.static("public"));

// issues
let issues;

// products
let products;

// customers
let customers;

// orders
let orders;

// sales
let sales;

// alerts
let alerts;

//notification count
let notificationCount;

// notifications
let notifications;

// tasks
let tasks;

const limit = 5;

app.get("/", (req,res) => {
    res.sendFile("index.html");
});

app.get("/live", async (req, res) => {
  console.log("Retrieving data from the tables ... ");

  try{

    // pagination was ONLY mentioned FOR CUSTOMERS table NOT PRODUCTS


    // customers
    const page = parseInt(req.query.page) || 1;
    // const currentPage = page;
    const offset = (page-1)*limit;
    
    // customer count
    const queryCount = `SELECT count(*) FROM customers`;
    const resultCount = await db.query(queryCount);
    const totalCustomers = resultCount.rows[0].count;
    // console.log(resultCount.rows[0].count);

    // customer table
    const totalPages = Math.ceil(totalCustomers/limit);

    const query = `SELECT * FROM customers ORDER BY ID LIMIT $1 OFFSET $2`;
    const result = await db.query(query, [limit, offset]);
    customers = result.rows;

    // sales cost
    const querySalesCost = `SELECT sum(saleamount) FROM sales`;
    const resultSalesCost = await db.query(querySalesCost);
    sales = resultSalesCost.rows[0].sum;
    // console.log(resultSalesCost.rows[0].sum);

    // sales table
    const querySales = 'SELECT products.name, sales.quantity, sales.saleamount FROM sales LEFT JOIN products ON sales.productid = products.id ORDER BY sales.id ASC';
    const resultSales = await db.query(querySales);
    products = resultSales.rows;
    // console.log(resultSales);

    // orders
    const queryOrders = 'SELECT count(quantity) FROM orders';
    const resultOrders = await db.query(queryOrders);
    orders = resultOrders.rows[0].count;
    // console.log(resultOrders);

    // issue count
    const queryIssuesCount = "SELECT count(id) FROM alerts WHERE type = 'issues'";
    const resultIssueCount = await db.query(queryIssuesCount);
    issues = resultIssueCount.rows[0].count;
    // console.log(resultIssueCount);

    // alerts
    const queryAlerts = "SELECT * FROM alerts WHERE type = 'issues'";
    const resultAlerts = await db.query(queryAlerts);
    alerts = resultAlerts.rows;
    // console.log(resultAlerts);

    // notification count
    const queryNotificationCount = "SELECT count(id) FROM alerts WHERE type = 'notifications'";
    const resultNotificationCount = await db.query(queryNotificationCount);
    notificationCount = resultNotificationCount.rows[0].count;
    // console.log(resultNotifications);

    // notifications
    const queryNotifications = "SELECT * FROM alerts WHERE type = 'notifications'";
    const resultNotifications = await db.query(queryNotifications);
    notifications = resultNotifications.rows;

    // tasks
    const queryTasks = "SELECT * FROM alerts WHERE type = 'tasks'";
    const resultTasks = await db.query(queryTasks);
    tasks = resultTasks.rows;


    res.render("live.ejs", {
      totalCustomers,
      customers,
      currentPage:page,
      totalPages,
      sales,
      products,
      orders,
      issues,
      alerts,
      notificationCount,
      notifications,
      tasks
    });

  } catch(err){
    res.status(500).json({
      error: "Internal server error",
      message: err.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
