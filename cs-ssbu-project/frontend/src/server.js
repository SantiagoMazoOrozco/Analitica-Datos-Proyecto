const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
require('dotenv').config();

// Esquema GraphQL
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Resolvers
const resolvers = {
  Query: {
    hello: () => 'Hello world!'
  }
};

// Crear una instancia del servidor Apollo
const server = new ApolloServer({ typeDefs, resolvers });

// Crear una instancia de Express
const app = express();

// Aplicar middleware de Apollo GraphQL
server.start().then(() => {
  server.applyMiddleware({ app });

  // Iniciar el servidor
  const port = process.env.PORT || 5000; // Usa el puerto de .env o 5000 por defecto
  app.listen({ port }, () =>
    console.log(`🚀 Servidor listo en http://localhost:${port}${server.graphqlPath}`)
  );
});
