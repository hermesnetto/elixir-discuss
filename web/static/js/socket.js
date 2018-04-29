import { Socket } from "phoenix";

let socket = new Socket("/socket", { params: { token: window.userToken } });

socket.connect();

const commentTemplate = comment => {
  const email = comment.user ? comment.user.email : "Anonymous";

  return `
    <li class="collection-item">
      ${comment.content}
      <div class="secondary-content">
        ${email}
      </div>
    </li>
  `;
};
const renderComment = event => {
  const renderedComment = commentTemplate(event.comment);
  console.log(renderedComment);

  document.querySelector(".collection").innerHTML += renderedComment;
};

const renderComments = comments => {
  const renderedComments = comments.map(commentTemplate);

  document.querySelector(".collection").innerHTML = renderedComments.join("");
};

const createSocket = topicId => {
  // Now that you are connected, you can join channels with a topic:
  let channel = socket.channel(`comments:${topicId}`, {});
  channel
    .join()
    .receive("ok", resp => {
      renderComments(resp.comments);
    })
    .receive("error", resp => {
      console.log("Unable to join", resp);
    });

  channel.on(`comments:${topicId}:new`, renderComment);

  document.querySelector("button").addEventListener("click", () => {
    const textarea = document.querySelector("textarea");
    const content = textarea.value;

    channel.push("comment:add", { content });

    textarea.value = "";
  });
};

window.createSocket = createSocket;
