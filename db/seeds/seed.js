const {
  topicData,
  articleData,
  commentData,
  userData
} = require("../data/index.js");

const { formatDates, formatComments, makeRefObj } = require("../utils/utils");

exports.seed = function(knex) {
  return knex.migrate
    .rollback()
    .then(() => {
      return knex.migrate.latest();
    })
    .then(() => {
      console.log("inserting topics and user data...");

      const topicsInsertions = knex("topics")
        .insert(topicData)
        .returning("*");
      const usersInsertions = knex("users")
        .insert(userData)
        .returning("*");
      return Promise.all([topicsInsertions, usersInsertions]);
    })
    .then(() => {
      console.log("inserting article data...");

      const formattedArticles = formatDates(articleData);
      return knex("articles")
        .insert(formattedArticles)
        .returning("*");
    })
    .then(articleRows => {
      // console.log(articleRows);

      /* 
  
        Your comment data is currently in the incorrect format and will violate your SQL schema. 
  
        Keys need renaming, values need changing, and most annoyingly, your comments currently only refer to the title of the article they belong to, not the id. 
        
        You will need to write and test the provided makeRefObj and formatComments utility functions to be able insert your comment data.
        */

      const articleRef = makeRefObj(articleRows);
      console.log(articleRef);

      const formattedComments = formatComments(commentData, articleRef);
      console.log(formattedComments);

      return knex("comments").insert(formattedComments);
    });
};
