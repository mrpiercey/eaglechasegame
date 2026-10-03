# The Ashland Eagle Chase 5K: The Game

A typing game for the Eagle Chase 5K. The faster you type, the faster the runner goes around the race course.

## Files

- `index.html` is the whole game. Double-click it to play in your browser.
- `eagles.png` is the eagle logo.
- `title.jpg` is the picture of the school behind the title screen.
- `titlescreenmusic1.webm` plays on the title screen and the runner picker.
- `ding.webm` and `startbeep.webm` are the countdown sounds.
- `runningmusic.webm` plays on a loop during the race.
- `finishline.webm` plays when you cross the finish line, while your place is shown. The podium follows when it ends.
- `endingmusic.webm` plays on the podium screen.
- `startracesoundeffect.webm` is not used by the game yet.
- `street-photos.js` is the old list of Street View photos. The game no longer uses it.

The game's colors and lettering are copied from the Eagle Chase race posters.

## How a game goes

1. The title screen shows the school and the game's name. Press Start, or any key.
2. Choose one of ten runners. They have no names. The game remembers your choice for next time.
3. Choose 1, 2 or 3 laps. Three laps is the full 5K, about 820 letters of typing. One lap is about 290. The title music keeps playing on this screen.
4. Wait for the start. After 2 seconds there are three dings, with a full second between them, then the start beep. The street shows a big 3..., 2... and 1... on the dings, then a big TYPE! on the beep, when the race begins.
5. Type the words on the race bib. The faster you type, the faster you run.

The speed meter on the race bib shows how fast you are going. Every correct letter pushes it up, so faster typing holds it higher.
Its color runs from blue when you are slow, through green and yellow, to red when you are flying.
If you stop typing, the meter drains over a few seconds, and your runner keeps moving until it is empty.
Two settings near the top of the script in `index.html` tune it: `DECAY` is how quickly it drains, and `METER_FULL` is the speed that fills it.

What you type is one long, chatty passage about the race. It always opens with the same two paragraphs, in the same order (`OPENING`: "Mark your calendar!" and "It's our fundraiser..."). The other paragraphs (`STORY`) are each a reason to sign up, and they follow in a new order each race. Both are at the top of the script in `index.html`.
The race bib shows three lines at a time. The line you are typing is bright, the lines under it are dim, and they slide up as you reach them.

Browsers do not let a page play sound until you click, tap or press a key, so the title music starts on your first one. There is no sound switch.

While you race, the top left of the street shows the faces of the first three racers, and yours below them if you are further back.
The top right shows a small map of the course. Your runner's face moves around it, the other runners are small dots, and the Eagle is a white dot.

When you cross the finish line, your place comes up over the street while the finish music plays. Then the podium screen shows the first three finishers, your place if you missed the podium, a link to sign up for the real race, and a Race again button.

You race 28 other runners and one Eagle, 30 racers in all. The race is built to stay close to whoever is typing, and to make them work for a win. It measures your speed so far in the race, counting only the time you were typing, and paces the field off that.

- The 13 slowest runners hold their own pace, between 6 and 20 words per minute.
- The 15 fastest runners pace themselves off your speed for the whole race: ten a little slower than you, five a little faster, all within sight. Slow down and they pass you. Speed up and you pass them.
- The Eagle flies about 45 pixels ahead of you for the first five sixths of the race, however fast or slow you type.
- In the last sixth, the Eagle flies 4% faster than your speed so far. To beat it you have to finish about 5% faster than you typed the rest of the race. It never gets more than 70 pixels ahead while you are still trying, so it stays in reach to the line.
- Nobody waits for you. The Eagle and the 15 fastest never drop under 80% of your speed, so if you stop typing they leave, and you have to catch up.
- Nobody but you may pass the Eagle, so the Eagle always finishes first or second.

`EAGLE_KICK` near the top of the script in `index.html` sets how hard the Eagle is to beat: 1 is easy, 1.04 is the setting now, 1.1 is very hard. The rest lives in the "field" part of `step`.
They each have a name (`FIELD_NAMES` in `index.html`, slowest first: Ethan, Nora, Caleb, Isla, Jordan, Priya, Sam, Ruby, Diego, Harper, Eli, Amara, Finn, Chloe, Noah, Grace, Tariq, Ella, Wyatt, Lucas, Maya, Henry, Zoe, Omar, Lucy, Ben, Aria and Jack. Adding a name to that list adds a runner). Names show on the leader tiles at the top left of the street and on the podium.
The scoreboard shows your place, and the little eagle above the progress bar shows how far the Eagle has gone.

## Leaderboard

The title screen has a Leaderboard button, next to Start the race, and after a race the podium screen asks for two initials (first and last) to put the run on the board.
Only the initials are stored, with the time, the typing speed and the number of errors.
The initials box only takes letters, two at most, and `FU` is refused by the game and by the database (`BAD_INITIALS` in `index.html` is the list; the database rules have their own copy).

There is one board for each lap count, 1, 2 or 3. Computer and mobile runs are on the same board, and each row says COMPUTER or MOBILE next to the initials. The game decides which one on its own, the same way it decides whether to use touch mode.
The leaderboard is sorted by fastest time and shows the top 50. Each row also shows the typing speed (words per minute) and the number of errors, but those are only shown, not ranked.
(In the database the computer and mobile runs are kept apart, under `boards/computer_1`, `boards/mobile_1` and so on. The game reads both and puts them together.)
Every finished race that gets initials goes on its board, whether or not it makes the top 50.

The scores live in a Firebase database (project `eaglechase`, on the free plan) at https://console.firebase.google.com/project/eaglechase/firestore.
The game reads and writes it directly, with no server in between. The database's rules only let a run be added, never changed or removed, and they check each run: two capital letters, a lap count of 1 to 3, and sane numbers.
To remove a run (a rude pair of initials, say), open the database in the Firebase console, find it under `boards`, and delete it there.

Add `#scores` to the end of the game's web address to open straight to the boards: https://game.eaglechase5k.com/#scores

## Phones and tablets

The game works in the browser on phones and iPads.

- Capital letters do not count: either case is accepted. Numbers, punctuation and spaces still have to be typed.
- Each letter carries the runner 1.6 times as far as on a computer (`BOOST` in `index.html`), so a race takes fewer letters and the Eagle can be caught when typing with thumbs.
- When the on-screen keyboard is up, the page shows only the scoreboard, the street, the speed meter and the words, sized to fit the room above the keyboard.
- When you finish, the keyboard goes away so the results have room.
- Each sound has a `.webm` file and an `.m4a` copy. Older iPhones and iPads cannot play WebM sound, so they use the `.m4a` copies.

On a computer, capital letters count as well.

## The course

The street is drawn like a 16-bit video game. It follows the real race map:

1. Start on Cramer Ave by the school.
2. Turn right onto Mentelle Park and run 350 meters down the far lane, about three quarters of the way. Cross through the gap in the median and run back up the near lane.
3. Turn right onto Cramer Ave, then left onto Richmond Ave.
4. Turn left onto Aurora Ave, then left onto N Ashland Ave.
5. Turn left onto Cramer Ave to start the next lap.

After the last lap, the runner goes straight across Cramer Ave and finishes in front of the school.

Every street is the right length compared to the others, so the turns come up where they do in the real race.
The screen follows the race map, with the map's left on the screen's left:

- Cramer Ave and Richmond Ave are run to the right.
- Mentelle Park is run to the left going out and to the right coming back.
- Aurora Ave and N Ashland Ave are run to the left, so the finish at the school is a run to the left.
- At a corner the runner goes off toward the top or the bottom of the screen, whichever way the next street heads on the map. The view then cuts to him already running down that street.
- The other runners come around each corner onto your street from the opposite edge of the screen.
Mentelle Park is drawn as one view with both lanes, so you can see the runner go down one side and come back on the other.
The whole course adds up to about 4,990 meters, which is a 5K.

## Changing the course

The course is the `LEGS` list near the top of the script in `index.html`. Each leg has:

- `m`, its length in meters.
- `cross`, the streets it meets, with how many meters in they are.
- `lots`, the houses along it, in order. Each one is a style letter, a wall color, a roof color and a door color.

Three numbers above the list change the whole race:

- `LAPS` is how many times the runner goes around. The player's choice on the lap screen sets it for each race.
- `STRIDE` is how far one letter carries the runner. A smaller number means more typing. At 50, the full race is about 820 letters.
- `PXM` is how many pixels of street stand for one meter.

## Looking at one spot

Add `#at=900` to the end of the game's web address to skip the title screen and start about 900 meters into the race. Any number works.
