# The Ashland Eagle Chase 5K: The Game

A typing game for the Eagle Chase 5K. The faster you type, the faster the runner goes around the race course.

## Files

- `index.html` is the whole game. Double-click it to play in your browser.
- `eagles.png` is the eagle logo shown at the top of the game.
- `street-photos.js` is the old list of Street View photos. The game no longer uses it.

The game's colors and lettering are copied from the Eagle Chase race posters.

## The course

The street is drawn like a 16-bit video game. It follows the real race map:

1. Start on Cramer Ave by the school.
2. Turn right onto Mentelle Park and run 350 meters down the near side, about three quarters of the way. Cross through the gap in the median and run back up the other side.
3. Turn right onto Cramer Ave, then left onto Richmond Ave.
4. Turn left onto Aurora Ave, then left onto N Ashland Ave.
5. Turn left onto Cramer Ave to start the next lap.

After three laps, the runner goes straight across Cramer Ave and finishes in front of the school.

Every street is the right length compared to the others, so the turns come up where they do in the real race.
At each corner the runner turns and runs off down the side street, then arrives on the next street from the opposite edge of the screen.
Mentelle Park is drawn as one view with both lanes, so you can see the runner go down one side and come back on the other.
The whole course adds up to about 4,990 meters, which is a 5K.

## Changing the course

The course is the `LEGS` list near the top of the script in `index.html`. Each leg has:

- `m`, its length in meters.
- `cross`, the streets it meets, with how many meters in they are.
- `lots`, the houses along it, in order. Each one is a style letter, a wall color, a roof color and a door color.

Three numbers above the list change the whole race:

- `LAPS` is how many times the runner goes around.
- `STRIDE` is how far one letter carries the runner. A smaller number means more typing. At 50, the full race is about 840 letters.
- `PXM` is how many pixels of street stand for one meter.

## Looking at one spot

Add `#at=900` to the end of the game's web address to start 900 meters into the race. Any number of meters works.
