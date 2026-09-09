import React from "react";
import {
  Heart,
  Mail,
  MessageCircle,
  ShieldCheck,
  Link as LinkIcon,
} from "lucide-react";
import "./Support.css";

function Support() {
  return (
    <main className="supportPage">
      <section className="supportContent">
        <div className="supportHeartCluster">
          <Heart size={15} fill="currentColor" />
          <Heart size={27} fill="currentColor" />
          <Heart size={13} fill="currentColor" />
        </div>

        <p className="supportEyebrow">
          We&apos;re here to help
        </p>

        <h1>
          I Love You So Much Support
        </h1>

        <p className="supportIntroduction">
          Need help with a private love note,
          sharing link, the Love Wall, or something
          else in the app? You&apos;re in the right place.
        </p>

        <div className="supportCard">
          <Mail size={23} />

          <div>
            <h2>Contact support</h2>

            <p>
              Email us and include a short description
              of what happened and, when helpful, the
              device or browser you were using.
            </p>

            <a
              href="mailto:support@iloveyousomuch.love"
              className="supportEmail"
            >
              support@iloveyousomuch.love
            </a>
          </div>
        </div>

        <section className="supportTopics">
          <h2>Common help topics</h2>

          <div className="supportTopicGrid">
            <article className="supportTopic">
              <LinkIcon size={21} />

              <h3>Private love notes</h3>

              <p>
                Private notes are opened through their
                unique share links. Anyone who has the
                link can view the note, so share it only
                with the intended recipient.
              </p>
            </article>

            <article className="supportTopic">
              <MessageCircle size={21} />

              <h3>Love Wall submissions</h3>

              <p>
                Public Love Wall messages are reviewed
                before publication. A submitted message
                may not appear immediately.
              </p>
            </article>

            <article className="supportTopic">
              <ShieldCheck size={21} />

              <h3>Reporting something</h3>

              <p>
                If you see a public message that seems
                inappropriate or concerning, use the
                report option on the Love Wall so it can
                be reviewed.
              </p>
            </article>
          </div>
        </section>

        <section className="supportPrivacy">
          <h2>Privacy questions?</h2>

          <p>
            You can read more about how I Love You So Much
            handles public submissions, private notes,
            and service data in our Privacy Policy.
          </p>

          <a href="/privacy">
            Read the Privacy Policy
          </a>
        </section>

        <a
          className="supportBackLink"
          href="/"
        >
          ← Back to I Love You So Much
        </a>

        <footer className="supportFooter">
          <p>
            I Love You So Much is a digital project from
            Stabile USA — independent ideas built around
            human connection.
          </p>
        </footer>
      </section>
    </main>
  );
}

export default Support;