exports.up = function(connection) {
  return connection.schema.createTable("articles", articlesTable => {
    articlesTable.increments("article_id").primary();
    articlesTable.string("title").notNullable();
    articlesTable.text("body").notNullable();
    articlesTable.integer("votes").defaultTo(0);
    articlesTable.string("topic");
    articlesTable
      .string("author")
      .references("users.username")
      .notNullable();
    articlesTable.timestamp("created_at").defaultTo(connection.fn.now());
  });
};

exports.down = function(connection) {
  return connection.schema.dropTable("articles");
};
