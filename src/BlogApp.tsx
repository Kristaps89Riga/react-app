import { useState, useEffect } from "react";

type Post = {
  id: number;
  text: string;
};

function BlogApp() {
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem("posts");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts));
  }, [posts]);

  const addPost = (newPost: string) => {
    setPosts([...posts, { id: Date.now(), text: newPost }]);
  };

  return (
    <div>
      <button onClick={() => addPost("New blog post!")}>Add Post</button>
      <ul>
        {posts.map(p => <li key={p.id}>{p.text}</li>)}
      </ul>
    </div>
  );
}

export default BlogApp;