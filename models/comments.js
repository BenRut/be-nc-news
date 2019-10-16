const connection = require("../db/connection");

exports.selectCommentsByArticleId = (id, sortBy = "comments_id", order) => {
  return connection
    .select("*")
    .from("comments")
    .where("article_id", id)
    .orderBy(sortBy, order);
};
