document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.querySelector("#user_id").value;
  const title = document.querySelector("#title").value;
  const content = document.querySelector("#content").value;

  const body = {
    id: Number(id),
    title: title,
    content: content,
  };

  const res = await fetch("http://localhost:5002/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log(data);
  fetchPosts();
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
