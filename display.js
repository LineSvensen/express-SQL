// function displayComments(postId, comments) {
//   const commentsContainer = document.querySelector(`#comments-${postId}`); // Make sure you have an element with this ID
//   commentsContainer.innerHTML = ""; // Clear any existing comments
//   comments.forEach((comment) => {
//     const commentDiv = document.createElement("div");
//     commentDiv.textContent = `${comment.commenter_name}: ${comment.content}`; // Assuming 'content' is the comment text
//     commentsContainer.appendChild(commentDiv);
//   });
// }

// function displayPosts(posts) {
//   const postsContainer = document.querySelector("#posts");
//   postsContainer.innerHTML = ""; // Clear old posts
//   posts.forEach((post) => {
//     const postDiv = document.createElement("div");
//     postDiv.classList.add("post");
//     postDiv.innerHTML = `
//         <h3>${post.title}</h3>
//         <p>${post.content}</p>
//         <button onclick="fetchComments(${post.id})">View Comments</button>
//         <div id="comments-${post.id}" class="comments"></div>
//       `;
//     postsContainer.appendChild(postDiv);
//   });
// }
