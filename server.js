//Criar o app, express...
const express = require("express");
const app = express();
const fs = require("fs");

//Inicialização do banco de dados SQLite
const dbFile = "./.data/pessoas.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);

//Se o banco não existir, crie ele primeiro
db.serialize(() => {
  // Cria a tabela "pessoas" se não existir
  db.run(`CREATE TABLE IF NOT EXISTS pessoas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cpf TEXT NOT NULL,
    telefone INTEGER NOT NULL,
    email TEXT NOT NULL
  )`, (err) => {
    if (err) {
      console.log("Erro ao criar a tabela pessoas:", err);
    } else {
      console.log("Tabela PESSOAS verificada/criada.");
    }
  });
  // Cria a tabela "criancas" se não existir
  db.run(`CREATE TABLE IF NOT EXISTS criancas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    escola TEXT NOT NULL,
    cartinha TEXT NOT NULL,
    imagem TEXT,
    pessoa_id INTEGER NOT NULL,
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id)
  )`, (err) => {
    if (err) {
      console.log("Erro ao criar a tabela criancas:", err);
    } else {
      console.log("Tabela CRIANCAS verificada/criada.");
    }
  });
});
  //Criando a tabela escolas
db.run(`CREATE TABLE IF NOT EXISTS escolas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inep TEXT NOT NULL,
    nome TEXT NOT NULL,
    endereco TEXT NOT NULL,
	  email TEXT NOT NULL
  )`, (err) => {
    if (err) {
      console.log("Erro ao criar a tabela escola:", err);
    } else {
      console.log("Tabela ESCOLA verificada/criada.");
    }
  });


//Vamos tratar quando o visitante acessar o "/" (página principal)
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/index.html");
});
//se nao colocar isso aqui o post não funciona
app.use(express.json());

// Rota GET para retornar todos as pessoas
app.get("/api/pessoas", function(request, response) {
  //response.json(pessoas);
  db.all("SELECT * FROM pessoas", (error, linhas) => {
    response.setHeader('content-type', 'text/json');
    return response.send(JSON.stringify(linhas));
  })
});


//ROTA GET para retornar uma única pessoa, passando o ID do mesmo na URL
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
});
  
//Rota POST para cadastrar uma pessoa...
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

// ATUALIZAR DADOS DA PESSOA...
app.patch("/api/pessoas/:id", function(request, response) {
  const pessoa_id = parseInt(request.params.id);
  
  
  
  //Passando TUDO, nome, cpf, telefone e email.....
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

//APAGAR PESSOA CORRIGIDO

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



//ROTA GET PARA RETORNAR AS CRIANÇAS
app.get("/api/criancas", function(request, response) {
  //response.json(pessoas);
  db.all("SELECT * FROM criancas", (error, linhas) => {
    response.setHeader('content-type', 'text/json');
    return response.send(JSON.stringify(linhas));
  })
});
//ROTA POST PARA CADASTRAR NOVAS CRIANÇAS
app.post("/api/criancas", function(request, response) {
 
  

  db.run("INSERT INTO criancas (nome, escola, cartinha, imagem, pessoa_id) VALUES (?, ?, ?, ?, ?) ", request.body.nome, request.body.escola, request.body.cartinha, request.body.imagem, request.body.pessoa_id, function(error){
  if(error) {
    return response.status(500).send(error);
    } else {
      return response.status(201).json({ id: this.lastID, nome: request.body.nome, escola: request.body.escola, cartinha: request.body.cartinha, imagem: request.body.imagem, pessoa_id: request.body.pessoa_id});
    }
  })
});

app.patch("/api/criancas", function(request, response) {
  return response.status(500).send("Erro interno do servidor!");
});
//ROTA GET PARA RETORNAR UMA ÚNICA CRIANÇA, PASSANDO O ID DO MESMO NA URL
app.get("/api/criancas/:id", function(request, response) {
  const crianca_id = parseInt(request.params.id)
  const sql = "SELECT id, nome, escola, cartinha, imagem, pessoa_id FROM pessoas WHERE id = ?";
  db.get(sql, [crianca_id], function(error, linha) {
    if (error) {
      return response.status(500).send(error);    
    } else {
      console.log(linha);
      if (!linha) {
        return response.status(404).send("Criança não encontrada"); 
      } else {
        response.setHeader('content-type', 'application/json');
        return response.send(JSON.stringify(linha));
      }
    }
  });
});
//ATUALIZAR OS DADOS DA CRIANÇA
app.patch("/api/crianca/:id", function(request, response) {
  const crianca_id = parseInt(request.params.id);
  
  
  
  //Passando TUDO, nome, escola, cartinha, imagem e pessoa_id.....
  let set = "";
  let valores = [];
  
  //Se vai ter nome
  if(request.body.nome != undefined){
    set = "nome=?";
    valores.push(request.body.nome);
  }
  
  //Se vai ter escola
  if(request.body.escola != undefined){
    if(set.length > 0) {
      set += ",";
      }
      set += "escola=?";
      valores.push(request.body.escola);
    }
  
  //Se vai ter cartinha
  if(request.body.cartinha != undefined){
    if(set.length > 0) {
      set += ",";
      }
      set += "cartinha=?";
      valores.push(request.body.cartinha);
    }
  
  //Se vai ter imagem
  if(request.body.imagem != undefined){
    if(set.length > 0) {
      set += ",";
      }
      set += "imagem=?";
      valores.push(request.body.imagem);
    }
 
  const sql = "UPDATE criancas SET " +set+ "WHERE id=?";
  valores.push(crianca_id);
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
//ROTA PARA APAGAR ALGUMA CRIANÇA DO BANCO
app.delete("/api/criancas/:id", function(request, response) {
 
  const crianca_id = parseInt(request.params.id);
  
  const sql = "DELETE FROM criancas WHERE id=?";
  db.run(sql, crianca_id, function(error) {
    if(error) {
      return response.status(500).send("Erro no servidor");
    } else {
      if (this.changes === 0) {
          return response.status(404).send("Criança não encontrada.");
      } else {
        return response.status(204).send();
      }
    }
  });
});

//ROTA GET PARA RETORNAR TODAS AS ESCOLAS CADASTRADAS
app.get("/api/escolas", function(request, response) {
  //response.json(pessoas);
  db.all("SELECT * FROM escolas", (error, linhas) => {
    response.setHeader('content-type', 'text/json');
    return response.send(JSON.stringify(linhas));
  })
});

//ROTA GET PARA RETORNAR UMA ÚNICA ESCOLA, PASSANDO O ID DO MESMO NA URL
app.get("/api/escolas/:id", function(request, response) {
  const escola_id = parseInt(request.params.id)
  const sql = "SELECT id, inep, nome, endereco, email FROM escolas WHERE id = ?";
  db.get(sql, [escola_id], function(error, linha) {
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
});

//ROTA POST PARA CADASTRAR UMA ESCOLA
app.post("/api/escolas", function(request, response) {
 
  db.run("INSERT INTO escola (inep, nome, endereco, email) VALUES (?, ?, ?, ?) ", request.body.inep, request.body.nome, request.body.endereco, request.body.email, function(error){
  if(error) {
    return response.status(500).send(error);
    } else {
      return response.status(201).json({ id: this.lastID, inep: request.body.inep, nome: request.body.nome, endereco: request.body.endereco, email: request.body.email});
    }
  })
});

app.patch("/api/escolas", function(request, response) {
  return response.status(500).send("Erro interno do servidor!");
});

//ATUALIZAR OS DADOS DA ESCOLA
app.patch("/api/escola/:id", function(request, response) {
  const escola_id = parseInt(request.params.id);
  
  
  
  //Passando TUDO, inep, nome, endereco, email.....
  let set = "";
  let valores = [];
  
  //Se vai ter inep
  if(request.body.inep != undefined){
    set = "inep=?";
    valores.push(request.body.inep);
  }
  
  //Se vai ter nome
  if(request.body.nome != undefined){
    if(set.length > 0) {
      set += ",";
      }
      set += "nome=?";
      valores.push(request.body.nome);
    }
  
  //Se vai ter endereço
  if(request.body.endereco != undefined){
    if(set.length > 0) {
      set += ",";
      }
      set += "endereco=?";
      valores.push(request.body.endereco);
    }
  
  //Se vai ter email
  if(request.body.email != undefined){
    if(set.length > 0) {
      set += ",";
      }
      set += "email=?";
      valores.push(request.body.email);
    }
 
  const sql = "UPDATE escolas SET " +set+ "WHERE id=?";
  valores.push(escola_id);
  console.log(sql);
  
  db.run(sql, valores, function(error) {
    if (error) {
      return response.status(500).send("Erro interno do servidor.");
    } else {
      if (this.changes === 0) {
        return response.status(404).send("Escola não encontrada.");
      } else {
        return response.status(200).send();
      }
    }
  });
});

  
//ROTA DELETE PARA APAGAR ALGUMA ESCOLA QUE ESTEJA CADASTRADA
app.delete("/api/escolas/:id", function(request, response) {
 
  const escola_id = parseInt(request.params.id);
  
  const sql = "DELETE FROM escolas WHERE id=?";
  db.run(sql, escola_id, function(error) {
    if(error) {
      return response.status(500).send("Erro no servidor");
    } else {
      if (this.changes === 0) {
          return response.status(404).send("Escola não encontrada.");
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