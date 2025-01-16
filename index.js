import dotenv from "dotenv/config";
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
const app = express();
const port = process.env.PORT || 5002;

// connecting to server. tells what and where
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use(cors());
app.use(express.json());

app.get("/users", async (req, res) => {
  const [result, fields] = await connection.query("SELECT * FROM user");
  res.json({
    result,
  });
});

app.get("/user/:id", async (req, res) => {
  const id = Number(req.params.id); // Convert param to a number
  if (!isNaN(id)) {
    // Check if the ID is a valid number
    try {
      // Use parameterized query to prevent SQL injection
      const [result] = await connection.execute(
        "SELECT * FROM user WHERE id = ?",
        [id] // Pass ID as a parameter
      );

      if (result.length) {
        res.json(result); // Send user data as JSON
      } else {
        res.status(404).send("No user found"); // Send 404 if no user found
      }
    } catch (e) {
      res.status(500).send("Database query error"); // Handle database errors
      console.error(error); // Log the error
    }
  } else {
    res.status(400).send("ID is not a valid number"); // Invalid ID response
  }
});

app.get("/posts", async (req, res) => {
  try {
    // Join `post` and `user` tables to get the publisher's name
    const [posts] = await connection.query(`
        SELECT post.*, user.name AS publisher_name
        FROM post
        JOIN user ON post.user_id = user.id
        ORDER BY post.created_at DESC
      `);
    res.json({ result: posts });
  } catch (error) {
    res.status(500).send("Error fetching posts");
    console.error(error);
  }
});

// app.post("/post", async (req, res) => {
//   const { id, title, content } = req.body;
//   const [result] = await connection.query(`
//     INSERT INTO post(title, content, user_id)
//     VALUES('${title}', '${content}', ${id});
//     `);
//   res.json(req.body);
// });

app.post("/post", async (req, res) => {
  const { name, title, content } = req.body;

  try {
    // Check if the user already exists
    let [user] = await connection.query("SELECT * FROM user WHERE name = ?", [
      name,
    ]);

    // If the user does not exist, insert a new user
    if (user.length === 0) {
      const [newUser] = await connection.query(
        "INSERT INTO user (name) VALUES (?)",
        [name]
      );
      user = [{ id: newUser.insertId, name }];
    }

    const userId = user[0].id;

    // Insert the post
    const [result] = await connection.query(
      "INSERT INTO post (title, content, user_id) VALUES (?, ?, ?)",
      [title, content, userId]
    );

    res
      .status(201)
      .json({ message: "Post created successfully", postId: result.insertId });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Error creating post" });
  }
});

app.get("/post/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [post] = await connection.query("SELECT * FROM post WHERE id = ?", [
      id,
    ]);
    const [comments] = await connection.query(
      `
        SELECT comment.content, user.name
        FROM comment
        JOIN user ON comment.user_id = user.id
        WHERE comment.post_id = ?`,
      [id]
    );

    res.json({ post: post[0], comments }); // Combine post and comments into one response
  } catch (error) {
    res.status(500).send("Error fetching post or comments");
    console.error(error);
  }
});

app.get("/comments/:postId", async (req, res) => {
  const postId = req.params.postId;
  try {
    const [comments] = await connection.query(
      `SELECT comment.content, comment.created_at, user.name
         FROM comment
         JOIN user ON comment.user_id = user.id
         WHERE comment.post_id = ?`,
      [postId]
    );
    res.json({ comments });
  } catch (error) {
    res.status(500).send("Error fetching comments");
    console.error(error);
  }
});

app.post("/comments", async (req, res) => {
  const { post_id, user_name, content } = req.body;

  try {
    // Check if user exists, create one if not
    let [user] = await connection.query("SELECT id FROM user WHERE name = ?", [
      user_name,
    ]);
    // creates user if does not exist in server
    if (!user.length) {
      const [result] = await connection.query(
        "INSERT INTO user (name) VALUES (?)",
        [user_name]
      );
      user = [{ id: result.insertId }];
    }
    // Insert the comment
    await connection.query(
      "INSERT INTO comment (content, post_id, user_id) VALUES (?, ?, ?)",
      [content, post_id, user[0].id]
    );

    res.status(201).send("Comment added successfully");
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).send("Error adding comment");
  }
});

app.get("/query", (req, res) => {
  res.send(req.query);
});

app.listen(port, () => {
  console.log("Server started on port:", port);
});
