import fs from "fs";
import path from "path";
import https from "https";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const publicDir = path.join("client", "public");

const images = [
  {
    name: "hockey",
    url: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Ice_hockey_puck_-_2.jpg",
  },
  {
    name: "tennis",
    url: "https://upload.wikimedia.org/wikipedia/commons/4/41/Closeup_of_a_tennis_ball_%282%29.jpg",
  },
];

async function downloadImage(name, urlStr) {
  const ext = urlStr.endsWith(".png") ? ".png" : ".jpg";
  const destPath = path.join(publicDir, `hero-${name}${ext}`);

  return new Promise((resolve, reject) => {
    https
      .get(
        urlStr,
        { headers: { "User-Agent": "CoolBot/1.0 (contact@cool.com)" } },
        res => {
          if (
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            https
              .get(
                res.headers.location,
                { headers: { "User-Agent": "CoolBot/1.0 (contact@cool.com)" } },
                redirectRes => {
                  const file = fs.createWriteStream(destPath);
                  redirectRes.pipe(file);
                  file.on("finish", () => {
                    file.close();
                    console.log(`Downloaded ${name}`);
                    resolve();
                  });
                }
              )
              .on("error", reject);
          } else {
            const file = fs.createWriteStream(destPath);
            res.pipe(file);
            file.on("finish", () => {
              file.close();
              console.log(`Downloaded ${name}`);
              resolve();
            });
          }
        }
      )
      .on("error", reject);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  for (const img of images) {
    await downloadImage(img.name, img.url);
    await sleep(2000);
  }
}

main().catch(console.error);
