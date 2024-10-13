//Criar o app, express...
const express = require("express");
const app = express();
const fs = require("fs");

//Inicialização do banco de dados SQLite
const dbFile = "./.data/produtos3.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);

//Se o banco não existir, crie ele primeiro
db.serialize(() => {
  if (!exists) { // (exists == false)
    db.run("CREATE TABLE pessoas (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, cpf INTEGER NOT NULL, telefone INTEGER NOT NULL, email TEXT NOT NULL)")
    console.log("Tabela PESSOAS criada!");
  }
  else
  {
    console.log("Tabela PESSOAS já existe e funciona bem!");
  }
});

//Vamos tratar quando o visitante acessar o "/" (página principal)
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/index.html");
});
//se nao colocar isso aqui o post não funciona
app.use(express.json());

// Rota GET para retornar todos os produtos
app.get("/api/pessoas", function(request, response) {
  //response.json(pessoas);
  db.all("SELECT * FROM pessoas", (error, linhas) => {
    response.setHeader('content-type', 'text/json');
    return response.send(JSON.stringify(linhas));
  })
});

//ROTA GET para retornar um único produto, passando o ID do mesmo na URL
app.get("/api/pessoas/:id", function(request, response) {
  const pessoa_id = parseInt(request.params.id)
  const sql = "SELECT id, nome, cpf, telefone, email FROM pessoas WHERE id = ?";
  db.get(sql, [pessoa_id], function(error, linha) {
    if (error) {
      return response.status(500).send(error);    
    } else {
      console.log(linha);
      if (!linha) {
        return response.status(404).send("Pessoa não encontrada"); 
      } else {
        response.setHeader('content-type', 'application/json');
        return response.send(JSON.stringify(linha));
      }
    }
  });
  /*
  const produto = produtos.find(i => i.id === produto_id);
  
  if (!produto) { // produto == false
    return response.status(404).send("Produto não encontrado");
  } else {
    return response.json(produto);
  }*/
});
  
//Rota POST para criar uma pessoa...
app.post("/api/pessoas", function(request, response) {
 
  

  db.run("INSERT INTO pessoas (nome, cpf, telefone, email) VALUES (?, ?, ?, ?) ", request.body.nome, request.body.cpf, request.body.telefone, request.body.email, function(error){
  if(error) {
    return response.status(500).send(error);
    } else {
      return response.status(201).json({ id: this.lastID, nome: request.body.nome, cpf: request.body.cpf, telefone: request.body.telefone, email: request.body.email});
    }
  })
});

app.patch("/api/pessoas", function(request, response) {
  return response.status(500).send("Erro interno do servidor!");
});

// ATUALIZAR PRODUTO...
app.patch("/api/pessoas/:id", function(request, response) {
  const pessoa_id = parseInt(request.params.id);
  
  
  
  //Passando TUDO, nome, preço, estoque.....
  let set = "";
  let valores = [];
  
  //Se vai ter nome
  if(request.body.nome != undefined){
    set = "nome=?";
    valores.push(request.body.nome);
  }
  
  //Se vai ter CPF
  if(request.body.cpf != undefined){
    if(set.length > 0) {
      set += ",";
      }
      set += "cpf=?";
      valores.push(request.body.cpf);
    }
  
  //Se vai ter telefone
  if(request.body.telefone != undefined){
    if(set.length > 0) {
      set += ",";
      }
      set += "telefone=?";
      valores.push(request.body.telefone);
    }
  
  //Se vai ter email
  if(request.body.email != undefined){
    if(set.length > 0) {
      set += ",";
      }
      set += "email=?";
      valores.push(request.body.email);
    }
  
  const sql = "UPDATE pessoas SET " +set+ "WHERE id=?";
  valores.push(pessoa_id);
  console.log(sql);
  
  db.run(sql, valores, function(error) {
    if (error) {
      return response.status(500).send("Erro interno do servidor.");
    } else {
      if (this.changes === 0) {
        return response.status(404).send("Pessoa não encontrada.");
      } else {
        return response.status(200).send();
      }
    }
  });
});

//APAGAR PRODUTO CORRIGIDO

app.delete("/api/pessoas/:id", function(request, response) {
 
  const pessoa_id = parseInt(request.params.id);
  
  const sql = "DELETE FROM pessoas WHERE id=?";
  db.run(sql, pessoa_id, function(error) {
    if(error) {
      return response.status(500).send("Erro no servidor");
    } else {
      if (this.changes === 0) {
          return response.status(404).send("Pessoa não encontrada.");
      } else {
        return response.status(204).send();
      }
    }
  });
});
/*   FIM DO MEU API SERVER      */


//"Listener"
const listener = app.listen(process.env.PORT, function() {
console.log("Your app is listening on port "+ listener.address().port);
});