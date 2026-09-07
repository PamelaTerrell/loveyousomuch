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

const ENVELOPE_THEMES = [
  {
    value: "blush",
    label: "Blush",
  },
  {
    value: "red",
    label: "Deep Red",
  },
  {
    value: "navy",
    label: "Navy",
  },
  {
    value: "forest",
    label: "Forest",
  },
  {
    value: "black",
    label: "Black",
  },
  {
    value: "ivory",
    label: "Ivory",
  },
];

const VALID_ENVELOPE_THEMES =
  ENVELOPE_THEMES.map((theme) => theme.value);

const SITE_URL =
  "https://www.iloveyousomuch.love";

const getSafeTheme = (value) =>
  VALID_ENVELOPE_THEMES.includes(value)
    ? value
    : "blush";

function PrivateLoveNote() {
  const pathParts = window.location.pathname
    .split("/")
    .filter(Boolean);

  /*
   * Reveal routes:
   *
   * /love/navy/TOKEN
   * /love/navy/TOKEN?preview=sender
   */
  const isRevealPage =
    pathParts[0] === "love" &&
    Boolean(pathParts[1]) &&
    Boolean(pathParts[2]);

  const themeFromPath =
    isRevealPage
      ? pathParts[1]
      : null;

  const shareToken =
    isRevealPage
      ? pathParts[2]
      : null;

  const revealTheme =
    getSafeTheme(themeFromPath);

  const searchParams =
    new URLSearchParams(
      window.location.search
    );

  const isSenderPreview =
    searchParams.get("preview") ===
    "sender";

  /*
   * Composer state
   */
  const [recipient, setRecipient] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [author, setAuthor] =
    useState("");

  const [
    envelopeTheme,
    setEnvelopeTheme,
  ] = useState("blush");

  const [submitting, setSubmitting] =
    useState(false);

  const [
    composerMessage,
    setComposerMessage,
  ] = useState("");

  /*
   * Created-note/share state
   */
  const [
    createdShareLink,
    setCreatedShareLink,
  ] = useState("");

  const [
    createdPreviewLink,
    setCreatedPreviewLink,
  ] = useState("");

  const [copied, setCopied] =
    useState(false);

  /*
   * Reveal state
   */
  const [
    privateNote,
    setPrivateNote,
  ] = useState(null);

  const [
    loadingNote,
    setLoadingNote,
  ] = useState(isRevealPage);

  const [
    noteError,
    setNoteError,
  ] = useState("");

  const charactersLeft =
    MAX_MESSAGE_LENGTH -
    message.length;

  /*
   * Load a private note when visiting
   * /love/THEME/TOKEN
   */
  useEffect(() => {
    if (
      !isRevealPage ||
      !shareToken
    ) {
      return;
    }

    let cancelled = false;

    const loadPrivateNote = async () => {
      setLoadingNote(true);
      setNoteError("");

      const { data, error } =
        await supabase.rpc(
          "get_private_love_note",
          {
            p_share_token:
              shareToken,
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

      const note =
        Array.isArray(data)
          ? data[0]
          : null;

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
  }, [
    isRevealPage,
    shareToken,
  ]);

  /*
   * Create private love note
   */
  const handleCreate = async (
    event
  ) => {
    event.preventDefault();

    const cleanRecipient =
      recipient.trim();

    const cleanMessage =
      message.trim();

    const cleanAuthor =
      author.trim();

    if (
      !cleanRecipient ||
      !cleanMessage
    ) {
      return;
    }

    const selectedTheme =
      getSafeTheme(envelopeTheme);

    setSubmitting(true);
    setComposerMessage("");
    setCreatedShareLink("");
    setCreatedPreviewLink("");
    setCopied(false);

    const { data, error } =
      await supabase.rpc(
        "create_private_love_note",
        {
          p_recipient:
            cleanRecipient,

          p_message:
            cleanMessage,

          p_author_name:
            cleanAuthor || null,

          p_envelope_theme:
            selectedTheme,
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

    const token =
      String(data);

    /*
     * This URL is shared with the recipient.
     * It lets Messages/social apps load
     * the matching themed preview image.
     */
    const shareLink =
      `${SITE_URL}/open/` +
      `${selectedTheme}/` +
      `${token}`;

    /*
     * This is the sender's direct preview.
     * It bypasses the Open Graph redirect
     * and opens the actual themed note.
     */
    const previewLink =
      `${SITE_URL}/love/` +
      `${selectedTheme}/` +
      `${token}` +
      `?preview=sender`;

    setCreatedShareLink(
      shareLink
    );

    setCreatedPreviewLink(
      previewLink
    );

    setRecipient("");
    setMessage("");
    setAuthor("");
    setEnvelopeTheme("blush");

    setSubmitting(false);
  };

  /*
   * Copy share URL
   */
  const copyShareLink = async () => {
    if (!createdShareLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        createdShareLink
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

  /*
   * Native share sheet
   */
  const sharePrivateNote =
    async () => {
      if (!createdShareLink) {
        return;
      }

      const shareText =
        `💗 Someone made you a private love note\n\n` +
        `Open your surprise here:\n${createdShareLink}`;

      try {
        if (navigator.share) {
          await navigator.share({
            title:
              "A private love note for you",

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
        if (
          error?.name !==
          "AbortError"
        ) {
          console.error(
            "Unable to share private note:",
            error
          );
        }
      }
    };

  /*
   * Open the phone's SMS composer
   */
  const textPrivateNote = () => {
    if (!createdShareLink) {
      return;
    }

    const textMessage =
      `💗 Someone made you a private love note\n\n` +
      `Open your surprise here:\n${createdShareLink}`;

    const encodedMessage =
      encodeURIComponent(
        textMessage
      );

    const isAppleDevice =
      /iPad|iPhone|iPod/.test(
        navigator.userAgent
      );

    const separator =
      isAppleDevice
        ? "&"
        : "?";

    window.location.href =
      `sms:${separator}body=${encodedMessage}`;
  };

  /*
   * Sender preview normally opens in
   * a separate tab. Close it to return
   * to the still-open send/share page.
   */
  const returnToSendPage = () => {
    if (window.opener) {
      window.close();
      return;
    }

    window.location.href =
      "/private";
  };

  /*
   * Private-note reveal page
   */
  if (isRevealPage) {
    return (
      <main
        className={
          `privateLovePage ` +
          `revealTheme-${revealTheme}`
        }
      >
        <section className="privateReveal">
          <div className="privateHeartCluster">
            <Heart
              size={15}
              fill="currentColor"
            />

            <Heart
              size={27}
              fill="currentColor"
            />

            <Heart
              size={13}
              fill="currentColor"
            />
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

          {!loadingNote &&
            noteError && (
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

          {!loadingNote &&
            privateNote && (
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

                <article
                  className={
                    `privateNoteCard ` +
                    `theme-${revealTheme}`
                  }
                >
                  <Sparkles
                    className="privateSparkle"
                    size={21}
                  />

                  <p className="privateRecipient">
                    For{" "}
                    {
                      privateNote.recipient
                    }
                  </p>

                  <blockquote>
                    “
                    {
                      privateNote.message
                    }
                    ”
                  </blockquote>

                  <p className="privateAuthor">
                    —{" "}
                    {
                      privateNote.author_name ||
                      "Someone who loves you"
                    }
                  </p>
                </article>

                {isSenderPreview ? (
                  <div className="senderPreviewActions">
                    <p>
                      This is how your private
                      love note will look when
                      they open it.
                    </p>

                    <button
                      type="button"
                      className="privatePrimaryButton senderReturnButton"
                      onClick={
                        returnToSendPage
                      }
                    >
                      ← Return to send page
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="privatePrivacyMessage">
                      <LockKeyhole
                        size={14}
                      />

                      This note was shared
                      privately and does not
                      appear on the Community
                      Wall.
                    </p>

                    <a
                      className="privateSecondaryButton"
                      href="/private"
                    >
                      Write one for someone
                      you love
                    </a>
                  </>
                )}
              </>
            )}
        </section>
      </main>
    );
  }

  /*
   * Private-note composer
   */
  return (
    <main className="privateLovePage">
      <section className="privateComposer">
        <div className="privateHeartCluster">
          <Heart
            size={15}
            fill="currentColor"
          />

          <Heart
            size={27}
            fill="currentColor"
          />

          <Heart
            size={13}
            fill="currentColor"
          />
        </div>

        <p className="privateEyebrow">
          For one heart only
        </p>

        <h1>
          Send someone a private little love note.
        </h1>

        <p className="privateIntroduction">
          Write something meant for one
          person. We&apos;ll give you a
          private link to send directly to
          them.
        </p>

        {!createdShareLink ? (
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
                  setRecipient(
                    event.target.value
                  )
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
                  setMessage(
                    event.target.value
                  )
                }
                placeholder="Write the thing you want only them to read..."
                maxLength={
                  MAX_MESSAGE_LENGTH
                }
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
                  setAuthor(
                    event.target.value
                  )
                }
                placeholder="Your name, initial, or leave it mysterious"
                maxLength={40}
              />
            </div>

            <div className="privateEnvelopeSection">
              <div className="privateEnvelopeHeading">
                <span>
                  Choose your envelope
                </span>

                <small>
                  Make it feel like them.
                </small>
              </div>

              <div
                className="privateEnvelopeChoices"
                role="radiogroup"
                aria-label="Choose envelope color"
              >
                {ENVELOPE_THEMES.map(
                  (theme) => {
                    const selected =
                      envelopeTheme ===
                      theme.value;

                    return (
                      <button
                        key={
                          theme.value
                        }
                        type="button"
                        role="radio"
                        aria-checked={
                          selected
                        }
                        className={
                          selected
                            ? `envelopeChoice envelope-${theme.value} envelopeChoiceActive`
                            : `envelopeChoice envelope-${theme.value}`
                        }
                        onClick={() =>
                          setEnvelopeTheme(
                            theme.value
                          )
                        }
                      >
                        <span
                          className="envelopePreview"
                          aria-hidden="true"
                        >
                          <span className="envelopeFlap" />

                          <Heart
                            className="envelopeSeal"
                            size={13}
                            fill="currentColor"
                          />
                        </span>

                        <span className="envelopeChoiceLabel">
                          {theme.label}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="privatePrivacyNotice">
              <LockKeyhole
                size={17}
              />

              <p>
                Private notes do not appear
                on the Community Wall.
                Anyone with the unique link
                can read the note, so only
                share the link with the
                person you intend.
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
              Take a peek before you send it.
            </h2>

            <p>
              Preview the finished note first,
              then share it whenever
              you&apos;re ready.
            </p>

            <a
              className="privatePreviewLink privatePreviewPrimary"
              href={
                createdPreviewLink
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <Sparkles size={16} />
              Preview their note
            </a>

            <div className="privateShareLink">
              <span>
                {createdShareLink}
              </span>

              <div className="privateShareActions">
                <button
                  type="button"
                  onClick={
                    copyShareLink
                  }
                  aria-label="Copy private love note link"
                >
                  {copied ? (
                    <Check size={17} />
                  ) : (
                    <Copy size={17} />
                  )}

                  {copied
                    ? "Copied"
                    : "Copy"}
                </button>

                <button
                  type="button"
                  onClick={
                    sharePrivateNote
                  }
                  aria-label="Share private love note"
                >
                  <Share2 size={17} />
                  Share
                </button>

                <button
                  type="button"
                  onClick={
                    textPrivateNote
                  }
                  aria-label="Send private love note by text message"
                >
                  <MessageCircle
                    size={17}
                  />
                  Text It
                </button>
              </div>
            </div>

            <p className="privateShareHint">
              The recipient will get the
              <strong>
                {" "}
                color-matched envelope
                preview{" "}
              </strong>
              you selected above.
            </p>

            <button
              type="button"
              className="privateSecondaryButton"
              onClick={() => {
                setCreatedShareLink(
                  ""
                );

                setCreatedPreviewLink(
                  ""
                );

                setComposerMessage(
                  ""
                );

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