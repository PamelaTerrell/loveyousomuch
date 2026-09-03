import React, { useEffect, useState } from "react";
import {
  Check,
  Heart,
  LogOut,
  Mail,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import "./Admin.css";

function Admin() {
  const [session, setSession] = useState(null);

  const [email, setEmail] = useState("");
  const [signInMessage, setSignInMessage] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [pendingNotes, setPendingNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [pageMessage, setPageMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (mounted) {
        setSession(currentSession);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (mounted) {
          setSession(nextSession);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setCheckingAdmin(false);
      setIsAdmin(false);
      return;
    }

    checkAdminStatus();
  }, [session]);

  useEffect(() => {
    if (isAdmin) {
      loadPendingNotes();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    setCheckingAdmin(true);

    const { data, error } = await supabase.rpc("is_admin");

    if (error) {
      console.error("Unable to verify administrator:", error);

      setIsAdmin(false);
      setPageMessage(
        "We couldn't verify administrator access."
      );
    } else {
      setIsAdmin(Boolean(data));
    }

    setCheckingAdmin(false);
  };

  const handleSignIn = async (event) => {
    event.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      return;
    }

    setSigningIn(true);
    setSignInMessage("");

    const { error } =
      await supabase.auth.signInWithOtp({
        email: cleanEmail,

        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

    if (error) {
      console.error("Unable to send admin login:", error);

      setSignInMessage(
        "The sign-in link couldn't be sent. Please try again."
      );
    } else {
      setSignInMessage(
        "Check your email. Your private sign-in link is on its way."
      );

      setEmail("");
    }

    setSigningIn(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();

    setIsAdmin(false);
    setPendingNotes([]);
  };

  const loadPendingNotes = async () => {
    setLoadingNotes(true);
    setPageMessage("");

    const { data, error } = await supabase
      .from("love_messages")
      .select(
        `
          id,
          recipient,
          message,
          author_name,
          category,
          visibility,
          moderation_status,
          created_at
        `
      )
      .eq("moderation_status", "pending")
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Unable to load pending notes:",
        error
      );

      setPageMessage(
        "The pending notes couldn't be loaded."
      );

      setLoadingNotes(false);
      return;
    }

    setPendingNotes(data || []);
    setLoadingNotes(false);
  };

  const approveNote = async (noteId) => {
    const { error } = await supabase
      .from("love_messages")
      .update({
        moderation_status: "approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", noteId);

    if (error) {
      console.error(
        "Unable to approve love note:",
        error
      );

      setPageMessage(
        "That love note couldn't be approved."
      );

      return;
    }

    setPendingNotes((currentNotes) =>
      currentNotes.filter(
        (note) => note.id !== noteId
      )
    );

    setPageMessage(
      "Love note approved. It can now appear on the community wall."
    );
  };

  const rejectNote = async (noteId) => {
    const { error } = await supabase
      .from("love_messages")
      .update({
        moderation_status: "rejected",
        approved_at: null,
      })
      .eq("id", noteId);

    if (error) {
      console.error(
        "Unable to reject love note:",
        error
      );

      setPageMessage(
        "That love note couldn't be rejected."
      );

      return;
    }

    setPendingNotes((currentNotes) =>
      currentNotes.filter(
        (note) => note.id !== noteId
      )
    );

    setPageMessage("Love note rejected.");
  };

  if (!session) {
    return (
      <main className="adminPage">
        <section className="adminLoginCard">
          <div className="adminHeart">
            <Heart
              size={25}
              fill="currentColor"
            />
          </div>

          <p className="adminEyebrow">
            I Love You So Much
          </p>

          <h1>Love Wall Admin</h1>

          <p className="adminIntroduction">
            A private little place for keeping the
            community wall kind.
          </p>

          <form
            className="adminLoginForm"
            onSubmit={handleSignIn}
          >
            <label htmlFor="admin-email">
              Administrator email
            </label>

            <div className="adminEmailField">
              <Mail size={18} />

              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <button
              type="submit"
              className="adminPrimaryButton"
              disabled={
                signingIn || !email.trim()
              }
            >
              <Heart
                size={16}
                fill="currentColor"
              />

              {signingIn
                ? "Sending..."
                : "Send my sign-in link"}
            </button>
          </form>

          {signInMessage && (
            <p
              className="adminStatus"
              role="status"
            >
              {signInMessage}
            </p>
          )}

          <a
            className="adminBackLink"
            href="/"
          >
            ← Back to the Community Wall
          </a>
        </section>
      </main>
    );
  }

  if (checkingAdmin) {
    return (
      <main className="adminPage">
        <div className="adminLoading">
          <Heart
            size={22}
            fill="currentColor"
          />

          Checking access...
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="adminPage">
        <section className="adminLoginCard">
          <ShieldCheck size={34} />

          <h1>Administrator access required</h1>

          <p>
            You are signed in, but this account has
            not been given permission to moderate
            the community wall.
          </p>

          <button
            type="button"
            className="adminSecondaryButton"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </section>
      </main>
    );
  }

  return (
    <div className="adminPage">
      <header className="adminHeader">
        <div>
          <p className="adminEyebrow">
            I Love You So Much
          </p>

          <h1>Community Moderation</h1>

          <p>
            Keep this little corner of the
            internet loving, gentle, and kind.
          </p>
        </div>

        <div className="adminHeaderActions">
          <button
            type="button"
            className="adminIconButton"
            onClick={loadPendingNotes}
            aria-label="Refresh pending notes"
          >
            <RefreshCw size={18} />
          </button>

          <button
            type="button"
            className="adminSecondaryButton"
            onClick={handleSignOut}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </header>

      <main className="adminContent">
        <section className="adminQueueHeading">
          <div>
            <p className="adminEyebrow">
              Waiting for a little review
            </p>

            <h2>
              Pending Love Notes
            </h2>
          </div>

          <div className="pendingCount">
            {pendingNotes.length}
          </div>
        </section>

        {pageMessage && (
          <div
            className="adminStatus"
            role="status"
          >
            {pageMessage}
          </div>
        )}

        {loadingNotes ? (
          <div className="adminEmptyState">
            <Heart
              size={22}
              fill="currentColor"
            />

            Gathering the pending love...
          </div>
        ) : pendingNotes.length === 0 ? (
          <div className="adminEmptyState">
            <Heart
              size={30}
              fill="currentColor"
            />

            <h3>
              All caught up.
            </h3>

            <p>
              There are no love notes waiting
              for review right now.
            </p>
          </div>
        ) : (
          <div className="moderationGrid">
            {pendingNotes.map((note) => (
              <article
                className="moderationCard"
                key={note.id}
              >
                <div className="moderationCardTop">
                  <span className="moderationCategory">
                    {note.category}
                  </span>

                  <span className="moderationDate">
                    {new Date(
                      note.created_at
                    ).toLocaleDateString()}
                  </span>
                </div>

                <p className="moderationRecipient">
                  For {note.recipient}
                </p>

                <blockquote>
                  “{note.message}”
                </blockquote>

                <p className="moderationAuthor">
                  — {note.author_name || "Anonymous"}
                </p>

                <div className="moderationActions">
                  <button
                    type="button"
                    className="rejectButton"
                    onClick={() =>
                      rejectNote(note.id)
                    }
                  >
                    <X size={17} />
                    Reject
                  </button>

                  <button
                    type="button"
                    className="approveButton"
                    onClick={() =>
                      approveNote(note.id)
                    }
                  >
                    <Check size={17} />
                    Approve
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <a
          className="adminWallLink"
          href="/"
        >
          <Heart
            size={15}
            fill="currentColor"
          />
          View the Community Wall
        </a>
      </main>
    </div>
  );
}

export default Admin;