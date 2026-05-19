"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ReactMarkdown from "react-markdown";

type SearchResult = {
  title: string;
  url: string;
  description: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  results?: SearchResult[];
};

export function SearchChat() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatLogRef = useRef<HTMLDivElement | null>(null);
  const chatShellRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Ask anything and I will run a live web search."
    }
  ]);

  const { scrollYProgress } = useScroll({
    target: chatShellRef,
    offset: ["start end", "start start"]
  });

  const chatScale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const chatOpacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 1]);

  useEffect(() => {
    const chatLog = chatLogRef.current;

    if (!chatLog) {
      return;
    }

    chatLog.scrollTo({
      top: chatLog.scrollHeight,
      behavior: "smooth"
    });
  }, [messages.length]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();

    if (!trimmed || isLoading) {
      return;
    }

    setIsLoading(true);
    setQuery("");

    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: trimmed })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Search failed");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: payload.summary,
        results: payload.results
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while searching.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Search error: ${message}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="chat-shell" aria-label="Web search chat" ref={chatShellRef}>
      <motion.div
        className="chat-frame"
        style={{
          scale: chatScale,
          opacity: chatOpacity
        }}
      >
        <header className="chat-topbar">
          <div className="chat-brand">
            <div className="brand-mark" aria-hidden="true">
              ✦
            </div>
            <div>
            <p className="chat-kicker">Live search chat</p>
            <h2>AI Chat Helper</h2>
            </div>
          </div>
        </header>

        <div className="chat-canvas">
          <div ref={chatLogRef} className="chat-log" role="log" aria-live="polite">
            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={`bubble ${message.role === "user" ? "user" : "assistant"}`}
              >
                {message.role === "user" ? (
                  <p>{message.content}</p>
                ) : (
                  <div className="bubble-md">
                    <ReactMarkdown
                      components={{
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noreferrer noopener">{children}</a>
                        )
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}

{message.results && message.results.length > 0 ? (
                  <ul className="result-list">
                    {message.results.map((result, i) => (
                      <li key={result.url}>
                        {i > 0 && <hr className="result-divider" />}
                        <a href={result.url} target="_blank" rel="noreferrer noopener" className="result-link">
                          {result.title}
                        </a>
                        <p>{result.description}</p>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>

          <form className="chat-form" onSubmit={onSubmit}>
            <div className="composer-shell">
              <button type="button" className="composer-utility" aria-label="Attach file">
                ⊕
              </button>

              <button type="button" className="composer-utility" aria-label="Voice input">
                ◌
              </button>

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Start typing..."
                aria-label="Search query"
                disabled={isLoading}
              />

              <button
                className="composer-send"
                type="submit"
                disabled={isLoading}
                aria-label="Send search"
              >
                <span className="composer-send-label">➤</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
