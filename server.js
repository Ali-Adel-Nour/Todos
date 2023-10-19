const { Client } = require("pg");
const express = require("express");

const app = express();

app.use(express.json())
const port = process.env.PORT || 3000

const client = new Client({
  user: "postgres",
  password: "ali",
  host: "localhost",
  port: 5433, // Change this to the correct port if your PostgresQL server is running on a different port
  database: "postgres"
});
app.get("/", (req, res) => res.sendFile(`${__dirname}/index.html`))

app.get("/todos",async(req,res)=>{
  const rows = await readTodos()
  res.setHeader("Content-Type", "application/json")
  res.send(JSON.stringify(rows))
})
app.listen(port,()=>{
  console.log('Web server is listening on port '+ port );
})

app.post("/todos", async (req, res) => {
  let result = {}
  try{
      const reqJson = req.body;
      result.success = await createTodo(reqJson.todo)
  }
  catch(e){
      result.success=false;
  }
  finally{
      res.setHeader("content-type", "application/json")
      res.send(JSON.stringify(result))
  }

})

app.delete("/todos", async (req, res) => {
  let result = {}
  try{
      const reqJson = req.body;
      result.success = await deleteTodo(reqJson.id)
  }
  catch(e){
      result.success=false;
  }
  finally{
      res.setHeader("content-type", "application/json")
      res.send(JSON.stringify(result))
  }

})

start();

async function start() {
  await connect();
  const todos = await readTodos();
  console.log(todos);

  const successCreate = await createTodo("Go to trader joes");
  console.log(`Creating was ${successCreate}`);

  const successDelete = await deleteTodo(1);
  console.log(`Deleting was ${successDelete}`);
}

async function connect() {
  try {
    await client.connect();
    console.log('Connected to the database');
  } catch (e) {
    console.error(`Failed to connect: ${e}`);
  }
}

async function readTodos() {
  try {
    const results = await client.query("SELECT id, text FROM todo"); // Changed table name to todo
    return results.rows;
  } catch (e) {
    console.error(`Error reading todos: ${e}`);
    return [];
  }
}

async function createTodo(todoText) {
  try {
    await client.query("INSERT INTO todo (text) VALUES ($1)", [todoText]); // Changed table name to todo
    return true;
  } catch (e) {
    console.error(`Error creating todo: ${e}`);
    return false;
  }
}

async function deleteTodo(id) {
  try {
    await client.query("DELETE FROM todo WHERE id = $1", [id]); // Changed table name to todo
    return true;
  } catch (e) {
    console.error(`Error deleting todo: ${e}`);
    return false;
  }
}
