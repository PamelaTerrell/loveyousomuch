// api/love-preview.js

export default function handler(req, res) {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    res.status(400).send("Invalid private love note.");
    return;
  }

  const revealUrl =
    `https://www.iloveyousomuch.love/love/${encodeURIComponent(token)}`;

  const previewImage =
    "https://www.iloveyousomuch.love/private-love-note-og.png";

  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />

        <title>A Private Love Note for You</title>

        <meta
          name="description"
          content="Someone loves you very much. A private love note is waiting for you."
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
          property="og:image"
          content="${previewImage}"
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
          property="og:type"
          content="website"
        />

        <meta
          property="og:url"
          content="${revealUrl}"
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
      </body>
    </html>
  `;

  res.setHeader(
    "Content-Type",
    "text/html; charset=utf-8"
  );

  res.setHeader(
    "Cache-Control",
    "public, max-age=0, s-maxage=86400"
  );

  res.status(200).send(html);
}