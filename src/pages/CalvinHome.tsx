import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import "./CalvinHome.css";
import initSqlJs, { SqlJsStatic } from "sql.js";

// About section
const AboutSection: React.FC = () => (
  <section id="about" className="s-about">
    <h2>About</h2>
    <p>
      Welcome to My Blog — a place to share ideas, creativity, and innovation.
      Built with React and local storage, this site lets you create and manage
      your own posts easily.
    </p>
  </section>
);

// Contact section
const ContactSection: React.FC = () => (
  <section id="contact" className="s-contact">
    <h2>Contact</h2>
    <p>Email: myblog@gmail.com</p>
    <p>Instagram: @myblog</p>
  </section>
);

// Post interface
interface Post {
  title: string;
  content: string;
  image?: string;
  id: string;
  createdAt: string;
}

const CalvinHome: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState<Omit<Post, "id" | "createdAt">>({
    title: "",
    content: "",
    image: "",
  });
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [dbReady, setDbReady] = useState(false);

  // Initialize SQLite database
useEffect(() => {
  (async () => {
    try {
      console.log("⏳ Initializing SQLite...");

      const SQL = await initSqlJs({
        locateFile: (file) => `/sql-wasm.wasm`, // ✅ load local file
      });

      const savedDb = localStorage.getItem("sqliteDB");
      let db;

      if (savedDb) {
        const binaryArray = new Uint8Array(JSON.parse(savedDb));
        db = new SQL.Database(binaryArray);
        console.log("✅ Loaded SQLite DB from localStorage");
      } else {
        db = new SQL.Database();
        db.run(`
          CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            title TEXT,
            content TEXT,
            image TEXT,
            createdAt TEXT
          );
        `);
        console.log("🆕 Created new SQLite DB");
      }

      // Load posts
      const result = db.exec("SELECT * FROM posts");
      if (result.length > 0) {
        const rows = result[0].values.map(([id, title, content, image, createdAt]: any[]) => ({
          id,
          title,
          content,
          image,
          createdAt,
        }));
        setPosts(rows);
      }

      (window as any).sqliteDB = db;
      setDbReady(true); // ✅ important!
      console.log("✅ Database ready");
    } catch (err) {
      console.error("❌ SQLite init failed:", err);
      alert("Failed to load SQLite. Check console for details.");
    }
  })();
}, []);

  // Resize image before storing
  const resizeImage = (file: File, maxWidth = 800, maxHeight = 600): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "image" && files && files[0]) {
      const file = files[0];
      resizeImage(file)
        .then((resizedBase64) => setNewPost((prev) => ({ ...prev, image: resizedBase64 })))
        .catch((err) => {
          console.error("Failed to resize image:", err);
          alert("Failed to process image.");
        });
    } else {
      setNewPost((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle blog submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dbReady) return alert("Database not ready yet.");

    if (!newPost.title.trim() || !newPost.content.trim()) {
      return alert("Please fill in both title and content.");
    }

    const post: Post = {
      ...newPost,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const db = (window as any).sqliteDB;
    if (db) {
      db.run("INSERT INTO posts VALUES (?, ?, ?, ?, ?)", [
        post.id,
        post.title,
        post.content,
        post.image || "",
        post.createdAt,
      ]);

      const data = db.export();
      localStorage.setItem("sqliteDB", JSON.stringify(Array.from(data)));

      const result = db.exec("SELECT * FROM posts");
      if (result.length > 0) {
        const rows = result[0].values.map(([id, title, content, image, createdAt]: any[]) => ({
          id,
          title,
          content,
          image,
          createdAt,
        }));
        setPosts(rows);
      }
    }

    setNewPost({ title: "", content: "", image: "" });
    setShowForm(false);
  };

  // Delete post
  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setPosts((prev) => prev.filter((p) => p.id !== id));
    const db = (window as any).sqliteDB;
    if (db) {
      db.run("DELETE FROM posts WHERE id = ?", [id]);
      const data = db.export();
      localStorage.setItem("sqliteDB", JSON.stringify(Array.from(data)));
    }
  };

  // Smooth scroll
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!dbReady) return <div className="loading-screen">Loading database...</div>;

  return (
    <div className={`calvin-container ${darkMode ? "dark" : ""}`}>
      {/* Header */}
      <header className="s-header">
        <div className="s-header__content">
          <a
            className="logo"
            role="button"
            tabIndex={0}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img src="/images/logo.png" alt="My Blog" />
          </a>
          <nav className="s-header__nav" aria-label="Main navigation">
            <ul className="s-header__nav-list">
              <li>
                <a href="#blog" onClick={(e) => { e.preventDefault(); scrollToSection("blog"); }}>Blog</a>
              </li>
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection("about"); }}>About</a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection("contact"); }}>Contact</a>
              </li>
            </ul>
          </nav>
          <button onClick={() => setDarkMode((prev) => !prev)} style={{ marginLeft: "20px" }}>
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="s-hero">
        <div className="s-hero__slide-content">
          <h2>Welcome to My Blog</h2>
          <p>Share your ideas and inspire others.</p>
        </div>
      </section>

      {/* Blog Section */}
      <main id="blog" className="s-content">
        <div className="centered">
          <button onClick={() => setShowForm(!showForm)} className="add-post-btn">
            {showForm ? "✖ Cancel" : "➕ Add New Blog"}
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="add-post-form">
            <h3>Create New Blog Post</h3>
            <input
              type="text"
              name="title"
              placeholder="Post Title"
              value={newPost.title}
              onChange={handleChange}
              required
            />
            <textarea
              name="content"
              rows={5}
              placeholder="Post Content"
              value={newPost.content}
              onChange={handleChange}
              required
            />
            <input type="file" name="image" accept="image/*" onChange={handleChange} />
            {newPost.image && (
              <div className="image-preview">
                <img src={newPost.image} alt="Preview" />
              </div>
            )}
            <button type="submit">Publish</button>
          </form>
        )}
        <section className="s-posts">
          {[...posts].reverse().map((post) => (
            <article className="s-post" key={post.id}>
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="s-post__thumb"
                  onClick={() => setModalImage(post.image ?? null)}
                  style={{ cursor: "pointer" }}
                />
              )}
              <div className="s-post__content">
                <h3 className="s-post__title">{post.title}</h3>
                <p className="s-post__excerpt">{post.content}</p>
                <div className="s-post__meta">
                  <small>Published on {new Date(post.createdAt).toLocaleDateString()}</small>
                </div>
                <button onClick={() => handleDelete(post.id)} className="delete-btn">
                  🗑 Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>

      {/* Modal */}
      {modalImage && (
        <div className="image-modal" onClick={() => setModalImage(null)}>
          <img src={modalImage} alt="Full Size" />
        </div>
      )}

      <AboutSection />
      <ContactSection />

      <footer className="s-footer">
        <div className="s-footer__content">
          <p>&copy; {new Date().getFullYear()} My Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CalvinHome;
