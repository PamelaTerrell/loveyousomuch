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
    typeof token !== "string" ||
    !token.trim()
  ) {
    return res
      .status(400)
      .send("Invalid private love note.");
  }

  const safeTheme =
    typeof theme === "string" &&
    allowedThemes.has(theme)
      ? theme
      : "blush";

  const encodedToken =
    encodeURIComponent(token);

  const revealUrl =
    `https://www.iloveyousomuch.love/love/` +
    `${safeTheme}/${encodedToken}`;

  const shareUrl =
    `https://www.iloveyousomuch.love/open/` +
    `${safeTheme}/${encodedToken}`;

  const previewImage =
    `https://www.iloveyousomuch.love/` +
    `private-love-note-og-${safeTheme}.png`;

  const html = `<!doctype html>
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
      content="Someone made you a private love note."
    />

    <meta
      property="og:type"
      content="website"
    />

    <meta
      property="og:title"
      content="A Private Love Note for You"
    />

    <meta
      property="og:description"
      content="Someone loves you very much. A private love note is waiting for you."
    />

    <meta
      property="og:url"
      content="${shareUrl}"
    />

    <meta
      property="og:image"
      content="${previewImage}"
    />

    <meta
      property="og:image:width"
      content="1200"
    />

    <meta
      property="og:image:height"
      content="630"
    />

    <meta
      property="og:image:alt"
      content="A private love note is waiting for you."
    />

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
      http-equiv="refresh"
      content="0;url=${revealUrl}"
    />
  </head>

  <body>
    <p>
      Opening your private love note...
    </p>

    <script>
      window.location.replace(
        ${JSON.stringify(revealUrl)}
      );
    </script>
  </body>
</html>`;

  res.setHeader(
    "Content-Type",
    "text/html; charset=utf-8"
  );

  res.setHeader(
    "Cache-Control",
    "public, max-age=0, s-maxage=300"
  );

  return res
    .status(200)
    .send(html);
}