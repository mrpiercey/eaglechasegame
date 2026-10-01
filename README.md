# The Ashland Eagle Chase 5K: The Game

A typing game for the Eagle Chase 5K. The faster you type, the faster the runner goes down Cramer Ave.

## Files

- `index.html` is the whole game. Double-click it to play in your browser.
- `street-photos.js` is the list of Street View photos. Add or remove links there.

## Adding more street photos

1. Open Google Maps Street View and face the houses, so you see the street from the side.
2. Copy the web address from the top of the browser.
3. Open `street-photos.js` and paste the address on a new line inside "quotes", with a comma at the end.
4. Save the file and refresh the game.

Keep the links in running order. Moving about 40 meters (130 feet) between photos lines them up best.

## Before sharing the game online

Right now the game shows Google's preview pictures, which is fine for testing on your own computer.
Before you put the game online, add a Google Maps API key in `street-photos.js` (Street View Static API).
If `street-photos.js` has no links, the game shows a cartoon street instead.
