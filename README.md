# The Ashland Eagle Chase 5K: The Game

A typing game for the Eagle Chase 5K. The faster you type, the faster the runner goes around the race course.

## Files

- `index.html` is the whole game. Double-click it to play in your browser.
- `eagles.png` is the eagle logo.
- `title.jpg` is the picture of the school behind the title screen.
- `titlescreenmusic1.webm` plays on the title screen and the runner picker.
- `ding.webm` and `startbeep.webm` are the countdown sounds.
- `runningmuiscgame.webm` plays on a loop during the race.
- `startracesoundeffect.webm` is not used by the game yet.
- `street-photos.js` is the old list of Street View photos. The game no longer uses it.

The game's colors and lettering are copied from the Eagle Chase race posters.

## How a game goes

1. The title screen shows the school and the game's name. Press Start, or any key.
2. Choose one of ten runners. The game remembers your choice for next time.
3. Wait for the start. After 2 seconds there are three dings, a quarter second apart, then the start beep. The race begins on the beep.
4. Type the words on the race bib. The faster you type, the faster you run.

There are 100 phrases to type. Each race puts them in a new random order. The list is `PHRASES` at the top of the script in `index.html`.

Browsers do not let a page play sound until you click, tap or press a key, so the title music starts on your first one.
The Sound button turns all sound off or back on.

You race 19 other runners and one Eagle. The other runners type between about 15 and 47 words per minute.
The Eagle is always the fastest. Its pace is picked fresh each race, somewhere between 50 and 80 words per minute.
The scoreboard shows your place, and the little eagle above the progress bar shows how far the Eagle has gone.

## The course

The street is drawn like a 16-bit video game. It follows the real race map:

1. Start on Cramer Ave by the school.
2. Turn right onto Mentelle Park and run 350 meters down the near side, about three quarters of the way. Cross through the gap in the median and run back up the other side.
3. Turn right onto Cramer Ave, then left onto Richmond Ave.
4. Turn left onto Aurora Ave, then left onto N Ashland Ave.
5. Turn left onto Cramer Ave to start the next lap.

After three laps, the runner goes straight across Cramer Ave and finishes in front of the school.

Every street is the right length compared to the others, so the turns come up where they do in the real race.
At each corner the runner turns and runs off down the side street. The view then cuts to him already running down the next street.
He runs to the right when he is heading away from the school (Cramer Ave, down Mentelle Park, N Ashland Ave) and to the left when he is heading back (up Mentelle Park, Richmond Ave, Aurora Ave).
Mentelle Park is drawn as one view with both lanes, so you can see the runner go down one side and come back on the other.
The whole course adds up to about 4,990 meters, which is a 5K.

## Changing the course

The course is the `LEGS` list near the top of the script in `index.html`. Each leg has:

- `m`, its length in meters.
- `cross`, the streets it meets, with how many meters in they are.
- `lots`, the houses along it, in order. Each one is a style letter, a wall color, a roof color and a door color.

Three numbers above the list change the whole race:

- `LAPS` is how many times the runner goes around.
- `STRIDE` is how far one letter carries the runner. A smaller number means more typing. At 50, the full race is about 820 letters.
- `PXM` is how many pixels of street stand for one meter.

## Looking at one spot

Add `#at=900` to the end of the game's web address to skip the title screen and start about 900 meters into the race. Any number works.
