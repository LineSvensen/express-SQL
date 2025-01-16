document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.querySelector("#user_name").value;
  const title = document.querySelector("#title").value;
  const content = document.querySelector("#content").value;

  const body = {
    name: name.trim(), // Send the name instead of ID
    title: title,
    content: content,
  };

  try {
    const res = await fetch("http://localhost:5002/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert("Post successfully created!"); // Add alert here
      fetchPosts(); // Refresh the posts
      document.querySelector("#user_name").value = ""; // Clear form fields
      document.querySelector("#title").value = "";
      document.querySelector("#content").value = "";
    } else {
      alert("Failed to create post");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while creating the post");
  }
});

async function fetchComments(postId) {
  const res = await fetch(`http://localhost:5002/comments/${postId}`);
  if (res.ok) {
    const data = await res.json();
    displayComments(postId, data.comments);
    console.log(data.comments);
  } else {
    console.log("No comments for this post");
  }
}

async function fetchPosts() {
  const res = await fetch("http://localhost:5002/posts"); // Ensure backend is running
  if (res.ok) {
    const data = await res.json();
    displayPosts(data.result);
  } else {
    console.error("Failed to fetch posts");
  }
}

function displayComments(postId, comments) {
  const commentsContainer = document.querySelector(`#comments-${postId}`);
  commentsContainer.innerHTML = "";
  comments.forEach((comment) => {
    const commentDiv = document.createElement("div");
    commentDiv.textContent = `${comment.name}: ${
      comment.content
    } (commented on ${new Date(comment.created_at).toLocaleString()})`;
    commentsContainer.appendChild(commentDiv);
  });
}

function displayPosts(posts) {
  const postsContainer = document.querySelector("#posts");
  postsContainer.innerHTML = ""; // Clear old posts
  posts.forEach((post) => {
    const postDiv = document.createElement("div");
    postDiv.classList.add("post");

    // Post content
    postDiv.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <small> By ${post.publisher_name} on ${new Date(
      post.created_at
    ).toLocaleString()}</small>
            <div id="comments-${post.id}" class="comments"></div>
            <input type="text" id="name-input-${post.id}" placeholder="Your name">
            <input type="text" id="comment-input-${
              post.id
            }" placeholder="Write a comment...">
            <button onclick="addComment(${post.id})">Add Comment</button>
          `;

    // View Comments button
    const button = document.createElement("button");
    button.textContent = "View Comments";
    button.addEventListener("click", () => fetchComments(post.id));
    postDiv.appendChild(button);

    // Add post to container
    postsContainer.appendChild(postDiv);
  });
}

// Fetch posts on page load
fetchPosts();

async function addComment(postId) {
  const commentInput = document.querySelector(`#comment-input-${postId}`);
  const nameInput = document.querySelector(`#name-input-${postId}`);
  const content = commentInput.value.trim();
  const userName = nameInput.value.trim(); // Get and trim the user's name

  if (!content || !userName) {
    alert("Name and Comment cannot be empty!");
    return;
  }

  try {
    // Send the comment to the backend
    const res = await fetch("http://localhost:5002/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post_id: postId,
        user_name: userName,
        content: content,
      }),
    });

    if (res.ok) {
      alert("Comment added successfully!");
      commentInput.value = ""; // Clear the input field
      nameInput.value = ""; // Clear the name field
      fetchComments(postId); // Reload comments for the post
    } else {
      console.error("Failed to add comment");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

window.addComment = addComment;
