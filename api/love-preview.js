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

  if (
    !token ||
    typeof token !== "string"
  ) {
    res
      .status(400)
      .send(
        "Invalid private love note."
      );

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

  const encodedToken =
    encodeURIComponent(token);

  /*
   * This is the actual private-note page.
   *
   * IMPORTANT:
   * Carry the selected theme into the reveal URL so
   * the recipient sees the same color chosen by the
   * sender.
   */
  const revealUrl =
    `https://www.iloveyousomuch.love/love/${encodedToken}` +
    `?theme=${safeTheme}`;

  /*
   * This is the URL shared through Messages,
   * Mail, social apps, etc.
   *
   * The selected theme is part of the URL so the
   * preview service knows which envelope image to use.
   */
  const shareUrl =
    `https://www.iloveyousomuch.love/open/${safeTheme}/${encodedToken}`;

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

        <title>
          A Private Love Note for You
        </title>

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

        <!--
          Human visitors continue to the actual
          private love note.

          The theme travels with them.
        -->

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
   * Each private note has a unique URL, so
   * caching its preview for a day is fine.
   */
  res.setHeader(
    "Cache-Control",
    "public, max-age=0, s-maxage=86400"
  );

  res
    .status(200)
    .send(html);
}