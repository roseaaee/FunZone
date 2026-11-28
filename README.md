# FunZone – Laro ng Lahi

FunZone is a free play-and-read website for Filipino preschoolers (about ages 3 to 6), in **English and Tagalog**.

- **Games:** 18 traditional Filipino games (*laro ng lahi*), such as Patintero, Taguan, Luksong Tinik, Piko and Sungka. Most games have 30 levels, and each level is a little harder than the one before.
- **Stories:** 52 picture storybooks that turn like real books, with read-aloud. Tap any word to hear it.
- **Coloring:** 12 color-by-number pictures that turn into smooth drawings when they are finished.
- **Dress-up:** children dress their own player for the games.
- **Grown-up corner:** a secret code, a screen-time limit, progress, and a way to record your own voice reading the stories.

It works on phones, tablets and computers, and it can be added to the home screen and used without internet.

## Safe for children

- No sign-up, no names, no photos, no ads and no tracking.
- Stars, choices and recordings are saved only on the phone or tablet. Nothing is sent anywhere.
- A grown-up can erase everything at any time in the grown-up corner.

## Try it on your computer

Open `index.html` in Chrome, Edge or Firefox. That's it.

For the full experience (adding to the home screen, using it without internet), publish it as shown below.

## Publish it on GitHub Pages (free)

1. Create a repository on GitHub and upload all the files in this folder (keep the folders as they are).
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick the `main` branch and the `/ (root)` folder, then **Save**.
4. After a minute or two, your site appears at `https://<your-username>.github.io/<repository-name>/`.

When you publish new files later, change the `VERSION` line at the top of `sw.js` (for example, to today's date). This makes phones that already have FunZone pick up the new version.

## Give the Tagalog lines a real Filipino voice (optional)

Phones often read Tagalog with a foreign accent. You can make a natural Filipino voice for every Tagalog line once, on your own computer:

```
pip install edge-tts
python3 tools/make_tagalog_voice.py
```

This saves about 740 short sound files in `voice/tl/`. Publish them with the rest of the files, and FunZone will play them instead of the phone's voice. Add `--voice angelo` for a man's voice. A line that sounds wrong can be fixed by deleting its file and running the command again.

## Folders and files

| File or folder | What it is |
|---|---|
| `index.html`, `styles.css` | The page and how it looks |
| `app.js` | Moving between screens, levels, the grown-up corner, Dress-up |
| `core.js`, `figures.js` | Shared helpers, the children drawings, sounds and voice |
| `lang.js`, `gameinfo.js`, `tutorial.js` | English and Tagalog words, game history, picture tutorials |
| `field.js` | The playground where children run around in the running games |
| `games-a.js`, `games-b.js`, `games-c.js` | The games |
| `reader.js`, `books.js`, `books/` | The storybook reader and the 52 books |
| `coloring.js`, `coloring-data.js` | Coloring and its pictures |
| `voice/tl/` | Tagalog voice files (made with the tool above) |
| `icons/`, `manifest.webmanifest`, `sw.js` | Home-screen icon and the offline copy |
| `tools/` | Helper programs for the person building FunZone (not used by the website itself) |

## For developers

Plain HTML, CSS and JavaScript, with no build step and no outside services.

- `python3 tools/import_books.py <books-folder> .` rebuilds `books.js` and `books/` from a storybook folder.
- `python3 tools/build_pictures.py coloring-data.js` rebuilds the coloring pictures from `tools/pixel_designs.py` (needs `pip install potracer numpy`).

## Credits

- Stories are retellings of public-domain tales and fables.
- Traditional game rules and history are summarized from common Filipino practice.
- Before publishing, make sure you have the right to share every storybook picture in `books/`.
