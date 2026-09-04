import React, { useEffect, useMemo, useState } from "react";
import {
  Heart,
  Send,
  Shuffle,
  Sparkles,
} from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import { supabase } from "./lib/supabase";
import "./App.css";
import Admin from "./Admin";

const MAX_MESSAGE_LENGTH = 500;

const categories = [
  "All",
  "Romantic",
  "Family",
  "Friendship",
  "Gratitude",
  "Missing You",
  "Pets",
  "Self-Love",
];

const starterNotes = [
  {
    id: "starter-1",
    recipient: "My husband",
    category: "Romantic",
    message:
      "You make ordinary days feel like the kind of life I used to hope I would find someday.",
    author: "P.",
    hearts: 22,
    featured: true,
    isStarter: true,
  },
  {
    id: "starter-2",
    recipient: "Mom",
    category: "Family",
    message:
      "The older I get, the more I understand how many quiet ways you loved me before I even knew to notice.",
    author: "Anonymous",
    hearts: 31,
    isStarter: true,
  },
  {
    id: "starter-3",
    recipient: "My best friend",
    category: "Friendship",
    message:
      "Thank you for knowing every version of me and still making room for who I am becoming.",
    author: "Anonymous",
    hearts: 18,
    isStarter: true,
  },
  {
    id: "starter-4",
    recipient: "Someone I miss",
    category: "Missing You",
    message:
      "There are still moments when something happens and my first thought is that I wish I could tell you.",
    author: "Anonymous",
    hearts: 41,
    isStarter: true,
  },
  {
    id: "starter-5",
    recipient: "My little dog",
    category: "Pets",
    message:
      "You never said a word, but somehow you always knew when I needed you beside me.",
    author: "Anonymous",
    hearts: 28,
    isStarter: true,
  },
  {
    id: "starter-6",
    recipient: "Me",
    category: "Self-Love",
    message:
      "I hope one day I stop measuring myself by everything I survived and start noticing how much of me is still capable of loving.",
    author: "Anonymous",
    hearts: 35,
    isStarter: true,
  },
];

const getBrowserId = () => {
  const storageKey = "love-wall-browser-id";

  try {
    let browserId = localStorage.getItem(storageKey);

    if (!browserId) {
      browserId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      localStorage.setItem(storageKey, browserId);
    }

    return browserId;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
};

function App() {
  const [notes, setNotes] = useState(starterNotes);

  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Romantic");

  const [activeCategory, setActiveCategory] = useState("All");

  const [loadingWall, setLoadingWall] = useState(true);
  const [wallError, setWallError] = useState("");

  const [randomNote, setRandomNote] = useState(null);

  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [heartedNotes, setHeartedNotes] = useState(new Set());

  useEffect(() => {
    let cancelled = false;

    const loadApprovedNotes = async () => {
      setLoadingWall(true);
      setWallError("");

      const { data, error } = await supabase
        .from("love_messages")
        .select(
          `
            id,
            recipient,
            message,
            author_name,
            category,
            hearts_count,
            created_at,
            approved_at
          `
        )
        .eq("visibility", "public")
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false });

      if (cancelled) {
        return;
      }

      if (error) {
        console.error("Unable to load community wall:", error);

        setWallError(
          "The community wall couldn't be refreshed right now, but a little love is still waiting for you."
        );

        setNotes(starterNotes);
        setLoadingWall(false);
        return;
      }

      const approvedNotes = (data || []).map((note) => ({
        id: note.id,
        recipient: note.recipient,
        message: note.message,
        author: note.author_name || "Anonymous",
        category: note.category,
        hearts: note.hearts_count || 0,
        createdAt: note.created_at,
        approvedAt: note.approved_at,
        isStarter: false,
      }));

      if (approvedNotes.length > 0) {
        setNotes(approvedNotes);
      } else {
        setNotes(starterNotes);
      }

      try {
        const browserId = getBrowserId();

        const {
          data: existingHearts,
          error: existingHeartsError,
        } = await supabase.rpc(
          "get_hearted_message_ids",
          {
            p_browser_id: browserId,
          }
        );

        if (existingHeartsError) {
          console.error(
            "Unable to load existing hearts:",
            existingHeartsError
          );
        } else if (!cancelled) {
          setHeartedNotes(
            new Set(
              (existingHearts || []).map(
                (heart) => heart.message_id
              )
            )
          );
        }
      } catch (heartLoadError) {
        console.error(
          "Unable to initialize browser heart state:",
          heartLoadError
        );
      }

      if (!cancelled) {
        setLoadingWall(false);
      }
    };

    loadApprovedNotes();

    return () => {
      cancelled = true;
    };
  }, []);

  const featuredNote =
    notes.find((note) => note.featured) || notes[0];

  const visibleNotes = useMemo(() => {
    if (activeCategory === "All") {
      return notes;
    }

    return notes.filter(
      (note) => note.category === activeCategory
    );
  }, [notes, activeCategory]);

  const totalHearts = useMemo(
    () =>
      notes.reduce(
        (sum, note) => sum + (note.hearts || 0),
        0
      ),
    [notes]
  );

  const charactersLeft =
    MAX_MESSAGE_LENGTH - message.length;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanRecipient = recipient.trim();
    const cleanMessage = message.trim();
    const cleanAuthor = author.trim();

    if (!cleanRecipient || !cleanMessage) {
      return;
    }

    setSubmitting(true);
    setSubmissionMessage("");

    const { error } = await supabase
      .from("love_messages")
      .insert({
        recipient: cleanRecipient,
        message: cleanMessage,
        author_name: cleanAuthor || null,
        category,
        visibility: "public",
        moderation_status: "pending",
        hearts_count: 0,
      });

    if (error) {
      console.error("Unable to submit love note:", error);

      setSubmissionMessage(
        "Your note couldn't be sent just yet. Please try again in a moment."
      );

      setSubmitting(false);
      return;
    }

    setRecipient("");
    setMessage("");
    setAuthor("");
    setCategory("Romantic");

    setSubmissionMessage(
      "Your love note made it safely to us. After a little review, it may become part of the community wall."
    );

    setSubmitting(false);
  };

  const handleHeart = async (noteId) => {
    const targetNote = notes.find(
      (note) => note.id === noteId
    );

    if (!targetNote) {
      return;
    }

    /*
     * Starter notes are not stored in Supabase.
     * Their hearts remain decorative/local until
     * the starter content is seeded into the database.
     */
    if (targetNote.isStarter) {
      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === noteId
            ? {
                ...note,
                hearts: (note.hearts || 0) + 1,
              }
            : note
        )
      );

      return;
    }

    if (heartedNotes.has(noteId)) {
      return;
    }

    const browserId = getBrowserId();

    /*
     * Optimistic update:
     * make the heart feel immediate.
     */
    setHeartedNotes((current) => {
      const updated = new Set(current);
      updated.add(noteId);
      return updated;
    });

    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              hearts: (note.hearts || 0) + 1,
            }
          : note
      )
    );

    const { data, error } = await supabase.rpc(
      "add_love_message_heart",
      {
        p_message_id: noteId,
        p_browser_id: browserId,
      }
    );

    if (error) {
      console.error("Unable to save heart:", error);

      setHeartedNotes((current) => {
        const updated = new Set(current);
        updated.delete(noteId);
        return updated;
      });

      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === noteId
            ? {
                ...note,
                hearts: Math.max(
                  0,
                  (note.hearts || 0) - 1
                ),
              }
            : note
        )
      );

      return;
    }

    /*
     * false means Supabase already had a heart
     * from this browser for this message.
     */
    if (data === false) {
      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === noteId
            ? {
                ...note,
                hearts: Math.max(
                  0,
                  (note.hearts || 0) - 1
                ),
              }
            : note
        )
      );
    }
  };

  const showRandomNote = () => {
    if (!notes.length) {
      return;
    }

    let choice =
      notes[Math.floor(Math.random() * notes.length)];

    if (
      notes.length > 1 &&
      randomNote &&
      choice.id === randomNote.id
    ) {
      const alternatives = notes.filter(
        (note) => note.id !== randomNote.id
      );

      choice =
        alternatives[
          Math.floor(Math.random() * alternatives.length)
        ];
    }

    setRandomNote(choice);

    requestAnimationFrame(() => {
      document
        .getElementById("random-love-note")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    });
  };

  return (
    <div className="lovePage">
      <header className="loveHero">
        <div
          className="heroHeartCluster"
          aria-hidden="true"
        >
          <Heart size={15} fill="currentColor" />
          <Heart size={24} fill="currentColor" />
          <Heart size={12} fill="currentColor" />
        </div>

        <p className="heroEyebrow">
          A little corner of the internet for love
        </p>

        <h1>I Love You So Much</h1>

        <p className="heroTagline">
          Sometimes “I love you” just isn&apos;t big enough.
        </p>

        <p className="heroIntroduction">
          So this is a place for the rest of it — the
          gratitude, tenderness, longing, laughter, devotion,
          memories, and tiny everyday things that make someone
          impossible to forget.
        </p>

        <a
          className="primaryAction"
          href="#leave-a-note"
        >
          Leave a little love
          <Heart size={16} fill="currentColor" />
        </a>
      </header>

      <main>
        <section className="communitySummary">
          <div className="summaryItem">
            <strong>{notes.length}</strong>
            <span>love notes</span>
          </div>

          <div className="summaryItem">
            <strong>{totalHearts}</strong>
            <span>hearts shared</span>
          </div>

          <div className="summaryItem">
            <strong>∞</strong>
            <span>reasons to say it</span>
          </div>
        </section>

        {featuredNote && (
          <section className="featuredSection">
            <div className="sectionHeading">
              <Sparkles size={18} />
              <span>Today&apos;s Love Note</span>
            </div>

            <article className="featuredNote">
              <div
                className="featuredHeart"
                aria-hidden="true"
              >
                <Heart size={22} fill="currentColor" />
              </div>

              <p className="noteRecipient">
                For {featuredNote.recipient}
              </p>

              <blockquote>
                “{featuredNote.message}”
              </blockquote>

              <div className="featuredNoteFooter">
                <span>
                  — {featuredNote.author}
                </span>

                {(() => {
                  const alreadyHearted =
                    heartedNotes.has(featuredNote.id);

                  return (
                    <button
                      type="button"
                      className={
                        alreadyHearted
                          ? "heartButton heartButtonActive"
                          : "heartButton"
                      }
                      onClick={() =>
                        handleHeart(featuredNote.id)
                      }
                      disabled={
                        !featuredNote.isStarter &&
                        alreadyHearted
                      }
                      aria-label={
                        alreadyHearted
                          ? `You sent a heart to this note. ${featuredNote.hearts} hearts`
                          : `Send a heart to this note. ${featuredNote.hearts} hearts`
                      }
                    >
                      <Heart
                        size={16}
                        fill={
                          alreadyHearted
                            ? "currentColor"
                            : "none"
                        }
                      />

                      {featuredNote.hearts}
                    </button>
                  );
                })()}
              </div>
            </article>
          </section>
        )}

        <section
          id="leave-a-note"
          className="noteComposerSection"
        >
          <div className="sectionIntroduction">
            <p className="sectionEyebrow">
              Say the thing
            </p>

            <h2>
              Leave a little love here.
            </h2>

            <p>
              Write something you hope they never forget.
              It can be romantic, grateful, funny, tender,
              bittersweet, or wonderfully ordinary.
            </p>
          </div>

          <form
            className="loveNoteForm"
            onSubmit={handleSubmit}
          >
            <div className="formRow">
              <div className="formField">
                <label htmlFor="recipient">
                  Who is this for?
                </label>

                <input
                  id="recipient"
                  type="text"
                  value={recipient}
                  onChange={(event) =>
                    setRecipient(event.target.value)
                  }
                  placeholder="My husband, Mom, Luna, someone special..."
                  maxLength={70}
                  required
                />
              </div>

              <div className="formField">
                <label htmlFor="category">
                  What kind of love is this?
                </label>

                <select
                  id="category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                >
                  {categories
                    .filter(
                      (item) => item !== "All"
                    )
                    .map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="formField">
              <label htmlFor="message">
                What do you want them to know?
              </label>

              <textarea
                id="message"
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                placeholder="Write the thing you never quite know how to say..."
                maxLength={MAX_MESSAGE_LENGTH}
                required
              />

              <div className="characterCounter">
                <span>
                  No perfect words required.
                </span>

                <span>
                  {charactersLeft} characters left
                </span>
              </div>
            </div>

            <div className="formField">
              <label htmlFor="author">
                From
                <span className="optionalLabel">
                  Optional
                </span>
              </label>

              <input
                id="author"
                type="text"
                value={author}
                onChange={(event) =>
                  setAuthor(event.target.value)
                }
                placeholder="Your first name, initial, or leave it anonymous"
                maxLength={40}
              />
            </div>

            <div className="formActions">
              <p>
                Please leave out phone numbers, addresses,
                email addresses, or anything else that should
                stay private.
              </p>

              <button
                type="submit"
                className="submitLoveButton"
                disabled={
                  submitting ||
                  !recipient.trim() ||
                  !message.trim()
                }
              >
                <Send size={16} />

                {submitting
                  ? "Sending your love..."
                  : "Add to the wall"}
              </button>
            </div>

            {submissionMessage && (
              <div
                className="submissionMessage"
                role="status"
              >
                <Heart
                  size={17}
                  fill="currentColor"
                />

                {submissionMessage}
              </div>
            )}
          </form>
        </section>

        <section className="discoverySection">
          <div className="discoveryContent">
            <p className="sectionEyebrow">
              A little surprise
            </p>

            <h2>
              Show me something beautiful.
            </h2>

            <p>
              Somewhere on this wall is a note from one human
              being to another. Maybe today you need to read
              that one.
            </p>

            <button
              type="button"
              className="secondaryAction"
              onClick={showRandomNote}
            >
              <Shuffle size={17} />
              Find me a love note
            </button>
          </div>

          {randomNote ? (
            <article
              id="random-love-note"
              className="randomNote"
            >
              <Heart
                className="randomNoteHeart"
                size={24}
                fill="currentColor"
              />

              <p className="noteRecipient">
                For {randomNote.recipient}
              </p>

              <blockquote>
                “{randomNote.message}”
              </blockquote>

              <span>
                — {randomNote.author}
              </span>
            </article>
          ) : (
            <article className="randomNote randomNotePlaceholder">
              <Heart
                className="randomNoteHeart"
                size={24}
                fill="currentColor"
              />

              <p>
                There&apos;s something lovely waiting here.
              </p>
            </article>
          )}
        </section>

        <section className="communityWallSection">
          <div className="wallHeading">
            <div>
              <p className="sectionEyebrow">
                From one heart to another
              </p>

              <h2>
                The Community Wall
              </h2>

              <p>
                Tiny reminders that love is happening
                everywhere, even on ordinary days.
              </p>
            </div>

            <Heart
              size={27}
              fill="currentColor"
            />
          </div>

          <div
            className="categoryFilters"
            aria-label="Filter love notes"
          >
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  activeCategory === item
                    ? "categoryFilter categoryFilterActive"
                    : "categoryFilter"
                }
                onClick={() =>
                  setActiveCategory(item)
                }
              >
                {item}
              </button>
            ))}
          </div>

          {loadingWall && (
            <div
              className="wallStatus"
              role="status"
            >
              <Heart
                size={17}
                fill="currentColor"
              />

              Gathering a little love...
            </div>
          )}

          {wallError && (
            <div
              className="wallStatus wallStatusError"
              role="status"
            >
              {wallError}
            </div>
          )}

          {!loadingWall && (
            <div className="loveNoteGrid">
              {visibleNotes.map((note) => {
                const alreadyHearted =
                  heartedNotes.has(note.id);

                return (
                  <article
                    className="loveNoteCard"
                    key={note.id}
                  >
                    <div className="noteCardTop">
                      <span className="noteCategory">
                        {note.category}
                      </span>

                      <Heart
                        size={16}
                        className="noteDecoration"
                        fill="currentColor"
                      />
                    </div>

                    <p className="noteRecipient">
                      For {note.recipient}
                    </p>

                    <blockquote>
                      “{note.message}”
                    </blockquote>

                    <p className="noteAuthor">
                      — {note.author}
                    </p>

                    <div className="noteActions">
                      <button
                        type="button"
                        className={
                          alreadyHearted
                            ? "heartButton heartButtonActive"
                            : "heartButton"
                        }
                        onClick={() =>
                          handleHeart(note.id)
                        }
                        disabled={
                          !note.isStarter &&
                          alreadyHearted
                        }
                        aria-label={
                          alreadyHearted
                            ? `You sent a heart to this note. ${note.hearts} hearts`
                            : `Send a heart to this note. ${note.hearts} hearts`
                        }
                      >
                        <Heart
                          size={16}
                          fill={
                            alreadyHearted
                              ? "currentColor"
                              : "none"
                          }
                        />

                        {note.hearts}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="communityPromise">
          <Heart
            size={24}
            fill="currentColor"
          />

          <div>
            <p className="sectionEyebrow">
              One little promise
            </p>

            <h2>
              Keep this corner kind.
            </h2>

            <p>
              This wall is for affection, gratitude,
              remembrance, encouragement, devotion, and all
              the quiet forms love can take. Public notes are
              reviewed before they appear here.
            </p>
          </div>
        </section>
      </main>

      <footer className="siteFooter">
        <Heart size={14} fill="currentColor" />

        <div className="footerText">
          <p>
            I Love You So Much is a digital project from{" "}
            <a
              href="https://www.stabileusa.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Stabile USA
            </a>{" "}
            — independent ideas built around human connection.
          </p>

          <p>
            Created by{" "}
            <a
              href="https://pamelajterrell.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pamela Terrell
            </a>.
          </p>
        </div>

        <Heart size={14} fill="currentColor" />
      </footer>

      <Analytics />
    </div>
  );
}

function RootApp() {
  if (window.location.pathname === "/admin") {
    return <Admin />;
  }

  return <App />;
}

export default RootApp;