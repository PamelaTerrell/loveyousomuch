import React from "react";
import {
  Heart,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import "./Privacy.css";

function Privacy() {
  return (
    <main className="privacyPage">
      <article className="privacyContent">
        <div className="privacyHeartCluster">
          <Heart size={15} fill="currentColor" />
          <Heart size={27} fill="currentColor" />
          <Heart size={13} fill="currentColor" />
        </div>

        <p className="privacyEyebrow">
          Privacy Policy
        </p>

        <h1>
          Your words deserve thoughtful handling.
        </h1>

        <p className="privacyUpdated">
          Last updated: September 9, 2026
        </p>

        <p className="privacyIntroduction">
          This Privacy Policy explains how
          I Love You So Much handles information
          when you use the website or mobile app.
        </p>

        <section>
          <h2>Information you choose to provide</h2>

          <p>
            You may provide information when you submit
            a public Love Wall message, create a private
            love note, report a public message, or contact
            support.
          </p>

          <p>
            Depending on the feature you use, this may
            include a recipient name or description,
            message text, author name or initials,
            selected category, envelope theme, report
            information, or information you include in
            a support email.
          </p>
        </section>

        <section>
          <h2>Public Love Wall messages</h2>

          <p>
            Messages submitted for the Love Wall are
            intended for possible public display.
            Submissions are reviewed before publication.
          </p>

          <p>
            Please do not include phone numbers,
            email addresses, home addresses, or other
            sensitive or identifying information in a
            public Love Wall submission.
          </p>
        </section>

        <section>
          <h2>Private love notes</h2>

          <div className="privacyCallout">
            <LockKeyhole size={20} />

            <p>
              Private love notes do not appear on the
              public Love Wall.
            </p>
          </div>

          <p>
            A private love note is stored so that it can
            be retrieved using its unique share link.
            Anyone who has that unique link can view the
            note.
          </p>

          <p>
            Private love notes should therefore be shared
            only with the intended recipient. These notes
            are link-accessible and should not be treated
            as end-to-end encrypted communication.
          </p>
        </section>

        <section>
          <h2>Reactions and reports</h2>

          <p>
            The Love Wall may store information needed
            to maintain persistent heart reactions,
            reduce duplicate reactions, process reports,
            and support moderation.
          </p>

          <p>
            Some of these features may use a browser or
            device identifier so participation can work
            without requiring a public user account.
          </p>
        </section>

        <section>
          <h2>Administrative accounts</h2>

          <p>
            Administrative access is protected through
            authenticated access. Administrative account
            information is used to operate and moderate
            the service.
          </p>
        </section>

        <section>
          <h2>Service providers</h2>

          <p>
            I Love You So Much uses service providers
            to operate the product. These currently
            include Supabase for database and
            authentication services, Vercel for hosting
            and serverless functionality, and Resend for
            certain email delivery.
          </p>

          <p>
            Those providers may process technical
            information necessary to provide their
            services in accordance with their own
            policies and applicable agreements.
          </p>
        </section>

        <section>
          <h2>Analytics and technical information</h2>

          <p>
            The service may collect technical and usage
            information such as page or feature usage,
            browser or device type, and similar
            diagnostic information used to understand
            how the product is used and to maintain its
            reliability.
          </p>
        </section>

        <section>
          <h2>How information is used</h2>

          <p>
            Information is used to provide the features
            you request, display approved public
            messages, deliver private-note experiences,
            maintain reactions and reports, moderate
            content, respond to support requests,
            protect the service, and improve product
            reliability.
          </p>
        </section>

        <section>
          <h2>How long information is kept</h2>

          <p>
            Private love notes currently remain
            available through their unique links unless
            they are removed or the service is changed.
            Public messages and moderation records may
            also be retained as needed to operate the
            Love Wall.
          </p>
        </section>

        <section>
          <h2>Children</h2>

          <p>
            I Love You So Much is not designed to
            knowingly collect personal information from
            children under 13. If you believe a child
            has provided personal information through
            the service, please contact support.
          </p>
        </section>

        <section>
          <h2>Changes to this policy</h2>

          <p>
            This policy may be updated as the product
            changes. The date at the top of this page
            will be updated when material changes are
            made.
          </p>
        </section>

        <section>
          <h2>Contact</h2>

          <div className="privacyContact">
            <ShieldCheck size={21} />

            <div>
              <p>
                Questions about privacy or the service
                can be sent to:
              </p>

              <a href="mailto:support@iloveyousomuch.love">
                support@iloveyousomuch.love
              </a>
            </div>
          </div>
        </section>

        <nav className="privacyLinks">
          <a href="/support">
            Support
          </a>

          <a href="/">
            Back to I Love You So Much
          </a>
        </nav>

        <footer className="privacyFooter">
          I Love You So Much is a digital project from
          Stabile USA — independent ideas built around
          human connection.
        </footer>
      </article>
    </main>
  );
}

export default Privacy;