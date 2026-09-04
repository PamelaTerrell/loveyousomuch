import React, { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Heart,
  LockKeyhole,
  MessageCircle,
  Send,
  Share2,
  Sparkles,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import "./PrivateLoveNote.css";

const MAX_MESSAGE_LENGTH = 500;

function PrivateLoveNote() {
  const pathParts = window.location.pathname
    .split("/")
    .filter(Boolean);

  const isRevealPage =
    pathParts[0] === "love" &&
    Boolean(pathParts[1]);

  const shareToken =
    isRevealPage ? pathParts[1] : null;

  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [author, setAuthor] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [createdLink, setCreatedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [composerMessage, setComposerMessage] = useState("");

  const [privateNote, setPrivateNote] = useState(null);
  const [loadingNote, setLoadingNote] =
    useState(isRevealPage);
  const [noteError, setNoteError] = useState("");

  const charactersLeft =
    MAX_MESSAGE_LENGTH - message.length;

  useEffect(() => {
    if (!isRevealPage || !shareToken) {
      return;
    }

    let cancelled = false;

    const loadPrivateNote = async () => {
      setLoadingNote(true);
      setNoteError("");

      const { data, error } = await supabase.rpc(
        "get_private_love_note",
        {
          p_share_token: shareToken,
        }
      );

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Unable to load private love note:",
          error
        );

        setNoteError(
          "This private love note couldn't be opened."
        );

        setLoadingNote(false);
        return;
      }

      const note = data?.[0];

      if (!note) {
        setNoteError(
          "This private love note doesn't seem to exist."
        );

        setLoadingNote(false);
        return;
      }

      setPrivateNote(note);
      setLoadingNote(false);
    };

    loadPrivateNote();

    return () => {
      cancelled = true;
    };
  }, [isRevealPage, shareToken]);

  const handleCreate = async (event) => {
    event.preventDefault();

    const cleanRecipient = recipient.trim();
    const cleanMessage = message.trim();
    const cleanAuthor = author.trim();

    if (!cleanRecipient || !cleanMessage) {
      return;
    }

    setSubmitting(true);
    setComposerMessage("");
    setCreatedLink("");
    setCopied(false);

    const { data, error } = await supabase.rpc(
      "create_private_love_note",
      {
        p_recipient: cleanRecipient,
        p_message: cleanMessage,
        p_author_name: cleanAuthor || null,
      }
    );

    if (error) {
      console.error(
        "Unable to create private love note:",
        error
      );

      setComposerMessage(
        "Your private note couldn't be created just yet. Please try again."
      );

      setSubmitting(false);
      return;
    }

    const link =
  `https://www.iloveyousomuch.love/open/${data}`;

    setCreatedLink(link);

    setRecipient("");
    setMessage("");
    setAuthor("");

    setSubmitting(false);
  };

  const copyShareLink = async () => {
    if (!createdLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        createdLink
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (error) {
      console.error(
        "Unable to copy private note link:",
        error
      );
    }
  };

  const sharePrivateNote = async () => {
    if (!createdLink) {
      return;
    }

    const shareText =
      `💗 Someone made you a private love note\n\n` +
      `Open your surprise here:\n${createdLink}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "A private love note for you",
          text: shareText,
        });

        return;
      }

      await navigator.clipboard.writeText(
        shareText
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error(
          "Unable to share private note:",
          error
        );
      }
    }
  };

  const textPrivateNote = () => {
    if (!createdLink) {
      return;
    }

    const textMessage =
      `💗 Someone made you a private love note\n\n` +
      `Open your surprise here:\n${createdLink}`;

    const encodedMessage =
      encodeURIComponent(textMessage);

    const isAppleDevice =
      /iPad|iPhone|iPod/.test(
        navigator.userAgent
      );

    const separator =
      isAppleDevice ? "&" : "?";

    window.location.href =
      `sms:${separator}body=${encodedMessage}`;
  };

  if (isRevealPage) {
    return (
      <main className="privateLovePage">
        <section className="privateReveal">
          <div className="privateHeartCluster">
            <Heart size={15} fill="currentColor" />
            <Heart size={27} fill="currentColor" />
            <Heart size={13} fill="currentColor" />
          </div>

          {loadingNote && (
            <div className="privateLoading">
              <Heart
                size={22}
                fill="currentColor"
              />

              Opening something meant just for you...
            </div>
          )}

          {!loadingNote && noteError && (
            <div className="privateError">
              <Heart size={25} />

              <h1>
                This little note is hiding.
              </h1>

              <p>
                {noteError}
              </p>

              <a
                className="privateSecondaryButton"
                href="/"
              >
                Visit the Community Wall
              </a>
            </div>
          )}

          {!loadingNote && privateNote && (
            <>
              <p className="privateEyebrow">
                Someone wanted you to have this
              </p>

              <h1>
                Someone loves you very much.
              </h1>

              <p className="privateRevealIntro">
                This little corner of the internet
                was made just for you.
              </p>

              <article className="privateNoteCard">
                <Sparkles
                  className="privateSparkle"
                  size={21}
                />

                <p className="privateRecipient">
                  For {privateNote.recipient}
                </p>

                <blockquote>
                  “{privateNote.message}”
                </blockquote>

                <p className="privateAuthor">
                  —{" "}
                  {privateNote.author_name ||
                    "Someone who loves you"}
                </p>
              </article>

              <p className="privatePrivacyMessage">
                <LockKeyhole size={14} />
                This note was shared privately and
                does not appear on the Community Wall.
              </p>

              <a
                className="privateSecondaryButton"
                href="/private"
              >
                Write one for someone you love
              </a>
            </>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="privateLovePage">
      <section className="privateComposer">
        <div className="privateHeartCluster">
          <Heart size={15} fill="currentColor" />
          <Heart size={27} fill="currentColor" />
          <Heart size={13} fill="currentColor" />
        </div>

        <p className="privateEyebrow">
          For one heart only
        </p>

        <h1>
          Send someone a private little love note.
        </h1>

        <p className="privateIntroduction">
          Write something meant for one person.
          We&apos;ll give you a private link to send
          directly to them.
        </p>

        {!createdLink ? (
          <form
            className="privateLoveForm"
            onSubmit={handleCreate}
          >
            <div className="privateFormField">
              <label htmlFor="private-recipient">
                Who is this for?
              </label>

              <input
                id="private-recipient"
                type="text"
                value={recipient}
                onChange={(event) =>
                  setRecipient(event.target.value)
                }
                placeholder="My husband, Mom, Sarah..."
                maxLength={70}
                required
              />
            </div>

            <div className="privateFormField">
              <label htmlFor="private-message">
                What do you want them to know?
              </label>

              <textarea
                id="private-message"
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                placeholder="Write the thing you want only them to read..."
                maxLength={MAX_MESSAGE_LENGTH}
                required
              />

              <div className="privateCharacterCounter">
                <span>
                  Just between the two of you.
                </span>

                <span>
                  {charactersLeft} characters left
                </span>
              </div>
            </div>

            <div className="privateFormField">
              <label htmlFor="private-author">
                From
                <span className="privateOptional">
                  Optional
                </span>
              </label>

              <input
                id="private-author"
                type="text"
                value={author}
                onChange={(event) =>
                  setAuthor(event.target.value)
                }
                placeholder="Your name, initial, or leave it mysterious"
                maxLength={40}
              />
            </div>

            <div className="privatePrivacyNotice">
              <LockKeyhole size={17} />

              <p>
                Private notes do not appear on the
                Community Wall. Anyone with the unique
                link can read the note, so only share
                the link with the person you intend.
              </p>
            </div>

            <button
              type="submit"
              className="privatePrimaryButton"
              disabled={
                submitting ||
                !recipient.trim() ||
                !message.trim()
              }
            >
              <Send size={17} />

              {submitting
                ? "Creating your note..."
                : "Create private love note"}
            </button>

            {composerMessage && (
              <p
                className="privateStatus"
                role="status"
              >
                {composerMessage}
              </p>
            )}
          </form>
        ) : (
          <section className="privateLinkCard">
            <div className="privateLinkHeart">
              <Heart
                size={26}
                fill="currentColor"
              />
            </div>

            <p className="privateEyebrow">
              Your private note is ready
            </p>

            <h2>
              Send this to someone you love.
            </h2>

            <p>
              They&apos;ll be able to tap the link
              and open their private note.
            </p>

            <div className="privateShareLink">
              <span>
                {createdLink}
              </span>

              <div className="privateShareActions">
                <button
                  type="button"
                  onClick={copyShareLink}
                  aria-label="Copy private love note link"
                >
                  {copied ? (
                    <Check size={17} />
                  ) : (
                    <Copy size={17} />
                  )}

                  {copied ? "Copied" : "Copy"}
                </button>

                <button
                  type="button"
                  onClick={sharePrivateNote}
                  aria-label="Share private love note"
                >
                  <Share2 size={17} />
                  Share
                </button>

                <button
                  type="button"
                  onClick={textPrivateNote}
                  aria-label="Send private love note by text message"
                >
                  <MessageCircle size={17} />
                  Text It
                </button>
              </div>
            </div>

            <p className="privateShareHint">
              For the sweetest experience, use
              <strong> Text It </strong>
              or
              <strong> Share </strong>
              so the recipient gets a tappable message.
            </p>

            <a
              className="privatePreviewLink"
              href={createdLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Preview their note
            </a>

            <button
              type="button"
              className="privateSecondaryButton"
              onClick={() => {
                setCreatedLink("");
                setComposerMessage("");
                setCopied(false);
              }}
            >
              Write another one
            </button>
          </section>
        )}

        <a
          className="privateBackLink"
          href="/"
        >
          ← Back to the Community Wall
        </a>
      </section>
    </main>
  );
}

export default PrivateLoveNote;