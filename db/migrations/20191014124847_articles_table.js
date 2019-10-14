exports.up = function(connection) {
  console.log("creating articles table...");
  return connection.schema.createTable("articles", articlesTable => {
    articlesTable.increments("article_id").primary();
    articlesTable.string("body");
    articlesTable.integer("votes").defaultTo(0);
    articlesTable.string("topic");
    articlesTable.string("author").references("users.username");
    articlesTable.timestamp("created_at").defaultTo(connection.fn.now());
  });
};

exports.down = function(connection) {
  console.log("removing articles table...");
  return connection.schema.dropTable("articles");
};