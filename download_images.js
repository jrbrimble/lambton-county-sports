import fs from "fs";
import path from "path";
import https from "https";
import { URL } from "url";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const publicDir = path.join("client", "public");

const sports = [
  "basketball",
  "soccer",
  "hockey",
  "baseball",
  "tennis",
  "gymnastics",
  "swimming",
  "football",
];

async function downloadImage(sport) {
  const url = `https://loremflickr.com/800/800/kids,${sport}/all`;
  const destPath = path.join(publicDir, `hero-${sport}.jpg`);

  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          let redirectUrl = res.headers.location;
          if (redirectUrl.startsWith("/")) {
            redirectUrl = `https://loremflickr.com${redirectUrl}`;
          }
          https
            .get(redirectUrl, redirectRes => {
              const file = fs.createWriteStream(destPath);
              redirectRes.pipe(file);
              file.on("finish", () => {
                file.close();
                console.log(`Downloaded ${sport}`);
                resolve();
              });
            })
            .on("error", reject);
        } else {
          const file = fs.createWriteStream(destPath);
          res.pipe(file);
          file.on("finish", () => {
            file.close();
            console.log(`Downloaded ${sport}`);
            resolve();
          });
        }
      })
      .on("error", reject);
  });
}

async function main() {
  for (const sport of sports) {
    await downloadImage(sport);
  }

  let content = fs.readFileSync("client/src/pages/Directory.tsx", "utf8");
  const oldImagesRegex = /const HERO_IMAGES = \[[^\]]+\];/s;
  const newImages = `const HERO_IMAGES = [
  "/hero-basketball.jpg",
  "/hero-soccer.jpg",
  "/hero-hockey.jpg",
  "/hero-baseball.jpg",
  "/hero-tennis.jpg",
];`;
  content = content.replace(oldImagesRegex, newImages);
  fs.writeFileSync("client/src/pages/Directory.tsx", content);
  console.log("Updated Directory.tsx");
}

main().catch(console.error);
