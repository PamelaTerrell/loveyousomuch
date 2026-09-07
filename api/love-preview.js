// api/love-preview.js

const allowedThemes = new Set([
  "blush",
  "red",
  "navy",
  "forest",
  "black",
  "ivory",
]);

export default function handler(req, res) {
  const { token, theme } = req.query;

  if (!token || typeof token !== "string") {
    res.status(400).send("Invalid private love note.");
    return;
  }

  /*
   * Only allow one of our known envelope themes.
   * Anything unexpected safely falls back to blush.
   */
  const safeTheme =
    typeof theme === "string" &&
    allowedThemes.has(theme)
      ? theme
      : "blush";

  /*
   * This is the actual private-note reveal page.
   */
  const revealUrl =
    `https://www.iloveyousomuch.love/love/${encodeURIComponent(token)}`;

  /*
   * This is the URL being shared through Messages,
   * Mail, social apps, etc.
   */
  const shareUrl =
    `https://www.iloveyousomuch.love/open/${safeTheme}/${encodeURIComponent(token)}`;

  /*
   * Each envelope color has its own preview image.
   */
  const previewImage =
    `https://www.iloveyousomuch.love/private-love-note-og-${safeTheme}.png`;

  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <title>A Private Love Note for You</title>

        <meta
          name="description"
          content="Someone loves you very much. A private love note is waiting for you."
        />

        <!-- Open Graph -->

        <meta
          property="og:title"
          content="A Private Love Note for You"
        />

        <meta
          property="og:description"
          content="Someone loves you very much. A private love note is waiting for you."
        />

        <meta
          property="og:image"
          content="${previewImage}"
        />

        <meta
          property="og:image:secure_url"
          content="${previewImage}"
        />

        <meta
          property="og:image:type"
          content="image/png"
        />

        <meta
          property="og:image:width"
          content="1536"
        />

        <meta
          property="og:image:height"
          content="1024"
        />

        <meta
          property="og:image:alt"
          content="A private love note is waiting for you."
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:url"
          content="${shareUrl}"
        />

        <meta
          property="og:site_name"
          content="I Love You So Much"
        />

        <!-- Twitter / compatible preview metadata -->

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content="A Private Love Note for You"
        />

        <meta
          name="twitter:description"
          content="Someone loves you very much. A private love note is waiting for you."
        />

        <meta
          name="twitter:image"
          content="${previewImage}"
        />

        <meta
          name="twitter:image:alt"
          content="A private love note is waiting for you."
        />

        <!-- Human visitors continue to the real note -->

        <meta
          http-equiv="refresh"
          content="0;url=${revealUrl}"
        />

        <script>
          window.location.replace(
            ${JSON.stringify(revealUrl)}
          );
        </script>
      </head>

      <body>
        <p>
          Opening your private love note...
        </p>

        <p>
          <a href="${revealUrl}">
            Open your love note
          </a>
        </p>
      </body>
    </html>
  `;

  res.setHeader(
    "Content-Type",
    "text/html; charset=utf-8"
  );

  /*
   * Preview services cache aggressively.
   * One day is fine because each private note gets
   * its own unique URL.
   */
  res.setHeader(
    "Cache-Control",
    "public, max-age=0, s-maxage=86400"
  );

  res.status(200).send(html);
}