import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Flag,
  Heart,
  LogOut,
  Mail,
  RefreshCw,
  ShieldCheck,
  Trash2,
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
  const [reports, setReports] = useState([]);

  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);

  const [pageMessage, setPageMessage] = useState("");
  const [activeAction, setActiveAction] = useState("");

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

    const checkAdminStatus = async () => {
      setCheckingAdmin(true);
      setPageMessage("");

      const { data, error } = await supabase.rpc("is_admin");

      if (error) {
        console.error(
          "Unable to verify administrator:",
          error
        );

        setIsAdmin(false);
        setPageMessage(
          "We couldn't verify administrator access."
        );
      } else {
        setIsAdmin(Boolean(data));
      }

      setCheckingAdmin(false);
    };

    checkAdminStatus();
  }, [session]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const loadAdminData = async () => {
      await Promise.all([
        loadPendingNotes(),
        loadReportedNotes(),
      ]);
    };

    loadAdminData();
  }, [isAdmin]);

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
          emailRedirectTo:
            `${window.location.origin}/admin`,
        },
      });

    if (error) {
      console.error(
        "Unable to send admin login:",
        error
      );

      if (
        error.message
          ?.toLowerCase()
          .includes("rate")
      ) {
        setSignInMessage(
          "Too many sign-in links were requested. Please wait a little while and try again."
        );
      } else {
        setSignInMessage(
          "The sign-in link couldn't be sent. Please try again."
        );
      }
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
    setReports([]);
  };

  const loadPendingNotes = async () => {
    setLoadingNotes(true);

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
    } else {
      setPendingNotes(data || []);
    }

    setLoadingNotes(false);
  };

  const loadReportedNotes = async () => {
    setLoadingReports(true);

    const { data, error } = await supabase
      .from("love_message_reports")
      .select(
        `
          id,
          message_id,
          reason,
          details,
          created_at,
          love_messages (
            id,
            recipient,
            message,
            author_name,
            category,
            visibility,
            moderation_status,
            created_at
          )
        `
      )
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Unable to load reported notes:",
        error
      );

      setPageMessage(
        "Reported notes couldn't be loaded."
      );
    } else {
      setReports(data || []);
    }

    setLoadingReports(false);
  };

  const refreshEverything = async () => {
    setPageMessage("");

    await Promise.all([
      loadPendingNotes(),
      loadReportedNotes(),
    ]);
  };

  const approveNote = async (noteId) => {
    setActiveAction(`approve-${noteId}`);

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

      setActiveAction("");
      return;
    }

    setPendingNotes((currentNotes) =>
      currentNotes.filter(
        (note) => note.id !== noteId
      )
    );

    setPageMessage(
      "Love note approved. It can now appear on the Community Wall."
    );

    setActiveAction("");
  };

  const rejectNote = async (noteId) => {
    setActiveAction(`reject-${noteId}`);

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

      setActiveAction("");
      return;
    }

    setPendingNotes((currentNotes) =>
      currentNotes.filter(
        (note) => note.id !== noteId
      )
    );

    setPageMessage("Love note rejected.");

    setActiveAction("");
  };

  const dismissReports = async (messageId) => {
    setActiveAction(`dismiss-${messageId}`);

    const { error } = await supabase
      .from("love_message_reports")
      .delete()
      .eq("message_id", messageId);

    if (error) {
      console.error(
        "Unable to dismiss reports:",
        error
      );

      setPageMessage(
        "Those reports couldn't be dismissed."
      );

      setActiveAction("");
      return;
    }

    setReports((currentReports) =>
      currentReports.filter(
        (report) =>
          report.message_id !== messageId
      )
    );

    setPageMessage(
      "Reports dismissed. The love note remains on the Community Wall."
    );

    setActiveAction("");
  };

  const removeReportedNote = async (messageId) => {
    setActiveAction(`remove-${messageId}`);

    const { error: noteError } = await supabase
      .from("love_messages")
      .update({
        moderation_status: "rejected",
        approved_at: null,
      })
      .eq("id", messageId);

    if (noteError) {
      console.error(
        "Unable to remove reported note:",
        noteError
      );

      setPageMessage(
        "That note couldn't be removed from the wall."
      );

      setActiveAction("");
      return;
    }

    const { error: reportError } = await supabase
      .from("love_message_reports")
      .delete()
      .eq("message_id", messageId);

    if (reportError) {
      console.error(
        "Note removed, but reports could not be cleared:",
        reportError
      );

      setPageMessage(
        "The love note was removed, but its report records still need review."
      );

      await loadReportedNotes();

      setActiveAction("");
      return;
    }

    setReports((currentReports) =>
      currentReports.filter(
        (report) =>
          report.message_id !== messageId
      )
    );

    setPageMessage(
      "The reported note was removed from the Community Wall."
    );

    setActiveAction("");
  };

  const reportedNoteGroups = useMemo(() => {
    const grouped = new Map();

    reports.forEach((report) => {
      const message = report.love_messages;

      if (!message) {
        return;
      }

      if (!grouped.has(report.message_id)) {
        grouped.set(report.message_id, {
          message,
          reports: [],
        });
      }

      grouped
        .get(report.message_id)
        .reports.push(report);
    });

    return Array.from(grouped.values());
  }, [reports]);

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
            A private little place for keeping
            the Community Wall loving, gentle,
            and kind.
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

          <h1>
            Administrator access required
          </h1>

          <p>
            You are signed in, but this account
            has not been given permission to
            moderate the Community Wall.
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

          <h1>
            Community Moderation
          </h1>

          <p>
            Keep this little corner of the
            internet loving, gentle, and kind.
          </p>
        </div>

        <div className="adminHeaderActions">
          <button
            type="button"
            className="adminIconButton"
            onClick={refreshEverything}
            aria-label="Refresh moderation queues"
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
        <section className="adminOverview">
          <div className="adminOverviewCard">
            <Heart
              size={20}
              fill="currentColor"
            />

            <div>
              <strong>
                {pendingNotes.length}
              </strong>

              <span>
                pending notes
              </span>
            </div>
          </div>

          <div className="adminOverviewCard adminOverviewAlert">
            <Flag size={20} />

            <div>
              <strong>
                {reportedNoteGroups.length}
              </strong>

              <span>
                reported notes
              </span>
            </div>
          </div>
        </section>

        {pageMessage && (
          <div
            className="adminStatus adminPageStatus"
            role="status"
          >
            {pageMessage}
          </div>
        )}

        {/* Pending submissions */}

        <section className="adminModerationSection">
          <div className="adminQueueHeading">
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
          </div>

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
                There are no new love notes
                waiting for review right now.
              </p>
            </div>
          ) : (
            <div className="moderationGrid">
              {pendingNotes.map((note) => {
                const approving =
                  activeAction ===
                  `approve-${note.id}`;

                const rejecting =
                  activeAction ===
                  `reject-${note.id}`;

                return (
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
                      —{" "}
                      {note.author_name ||
                        "Anonymous"}
                    </p>

                    <div className="moderationActions">
                      <button
                        type="button"
                        className="rejectButton"
                        disabled={
                          approving ||
                          rejecting
                        }
                        onClick={() =>
                          rejectNote(note.id)
                        }
                      >
                        <X size={17} />

                        {rejecting
                          ? "Rejecting..."
                          : "Reject"}
                      </button>

                      <button
                        type="button"
                        className="approveButton"
                        disabled={
                          approving ||
                          rejecting
                        }
                        onClick={() =>
                          approveNote(note.id)
                        }
                      >
                        <Check size={17} />

                        {approving
                          ? "Approving..."
                          : "Approve"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Reported public notes */}

        <section className="adminModerationSection reportedQueueSection">
          <div className="adminQueueHeading">
            <div>
              <p className="adminEyebrow">
                Community reports
              </p>

              <h2>
                Reported Love Notes
              </h2>

              <p className="queueDescription">
                Review notes that visitors have
                flagged after they appeared on
                the Community Wall.
              </p>
            </div>

            <div className="reportedCount">
              {reportedNoteGroups.length}
            </div>
          </div>

          {loadingReports ? (
            <div className="adminEmptyState">
              <Flag size={22} />

              Gathering community reports...
            </div>
          ) : reportedNoteGroups.length === 0 ? (
            <div className="adminEmptyState">
              <Heart
                size={30}
                fill="currentColor"
              />

              <h3>
                Nothing troubling here.
              </h3>

              <p>
                No approved love notes have
                active community reports.
              </p>
            </div>
          ) : (
            <div className="reportedNotesList">
              {reportedNoteGroups.map(
                ({ message, reports: noteReports }) => {
                  const dismissing =
                    activeAction ===
                    `dismiss-${message.id}`;

                  const removing =
                    activeAction ===
                    `remove-${message.id}`;

                  return (
                    <article
                      className="reportedModerationCard"
                      key={message.id}
                    >
                      <div className="reportWarningHeader">
                        <div>
                          <div className="reportBadge">
                            <AlertTriangle
                              size={15}
                            />

                            {noteReports.length}{" "}
                            {noteReports.length === 1
                              ? "report"
                              : "reports"}
                          </div>

                          <p className="moderationRecipient">
                            For {message.recipient}
                          </p>
                        </div>

                        <span className="moderationCategory">
                          {message.category}
                        </span>
                      </div>

                      <blockquote>
                        “{message.message}”
                      </blockquote>

                      <p className="moderationAuthor">
                        —{" "}
                        {message.author_name ||
                          "Anonymous"}
                      </p>

                      <div className="reportDetailsList">
                        <p className="reportDetailsHeading">
                          Why people reported it
                        </p>

                        {noteReports.map(
                          (report) => (
                            <div
                              className="adminReportItem"
                              key={report.id}
                            >
                              <div className="adminReportItemTop">
                                <strong>
                                  {report.reason}
                                </strong>

                                <span>
                                  {new Date(
                                    report.created_at
                                  ).toLocaleString()}
                                </span>
                              </div>

                              {report.details && (
                                <p>
                                  {report.details}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>

                      <div className="reportedModerationActions">
                        <button
                          type="button"
                          className="keepNoteButton"
                          disabled={
                            dismissing ||
                            removing
                          }
                          onClick={() =>
                            dismissReports(
                              message.id
                            )
                          }
                        >
                          <Check size={17} />

                          {dismissing
                            ? "Keeping..."
                            : "Keep Note"}
                        </button>

                        <button
                          type="button"
                          className="removeNoteButton"
                          disabled={
                            dismissing ||
                            removing
                          }
                          onClick={() =>
                            removeReportedNote(
                              message.id
                            )
                          }
                        >
                          <Trash2 size={17} />

                          {removing
                            ? "Removing..."
                            : "Remove From Wall"}
                        </button>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>

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