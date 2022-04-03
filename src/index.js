const express = require('express');
const cors = require('cors');
const { v4:uuidv4 } = require('uuid');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username)

  if(!user){
    return response.status(404).json({error: "User not exists!"})
  }
  request.user = user
  return next()
}
app.get('/users', (request, response)=>{
  return response.status(200).json(users)
})
app.post('/users', (request, response) => {
  // const { id } = request.headers;
  const { name, username } = request.body;
  const exists = users.some((user)=> user.username === username)
  if(exists){
    return response.status(400).json({error: "User already exists!"})
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user);
  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  let { title, deadline } = request.body;
  const { user } = request;
  
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  let { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;
  
  const todo = user.todos.find((todo)=> todo.id === id);
  if(todo){
    todo.deadline = deadline;
    todo.title = title;
    return response.status(200).json(todo)
  }
  else{
    return response.status(404).json({error: "TODO does not exist!"})
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo)=> todo.id === id)
  if(todo){
    todo.done = true;
    response.status(200).json(todo);
  }
  else{
    return response.status(404).json({error: "TODO does not exist!"})
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo)=>todo.id === id)
  if(todo){
    user.todos.splice(todo, 1);
    return response.status(204).send()
  }
  else{
    return response.status(404).send({error: "TODO does not exist!"})
  }
});

module.exports = app;