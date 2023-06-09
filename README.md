![logo](codesketch_logo.png)

Welcome to CodeSketch. This is a fun interactive game that tests your drawing skills and knowledge of computer science. The objective of the game is to draw a word prompt provided by the game, and have other players guess what you are drawing in a limited amount of time.

![preview](preview.gif)

## Tips for Playing

- Keep your drawings simple and clear, focusing on key details that will help guessers identify the word.
- Use different colors to add depth and dimension to your drawing. It makes it easier for guessers to distinguish among details.
- Be quick with your guesses, but also pay attention to the details of the drawing.
- Pay attention to the chat box as it might gie you clues on the other players' thinking.
- Remember, it's all about having fun and being creative!

## How To Run

To start the game on your local machine follow these steps:

1. `cd` into the server folder and run `npm start`
2. `cd` into the client folder and run `npm start`
3. Visit the client at `http://localhost:3000` on your browser.

## Tech Stack

Backend:

- NodeJS
- WebSocket (ws)
- Express (needed for future improvements)

Frontend:

- React
- React Router

The front end displays the lobby and game interface. It connects to the backend via the WebSocket protocol. Once enough users (5) have connected to the same game instance, the game is started. The game lifecycle is handled on the backend cycling through the states:

- GAME WAITING
- GAME START
- ROUND START
- ROUND END
- GAME END

The game has a default duration of six rounds, at the end of the last round the game enters into the GAME END state (the game automatically restarts after 60s).

## Game Stages
### Drawing
![drawing](drawing.gif)
### Guessing
![guessing](guessing.gif)

## Future Improvements

1. The `floodFill` function that handles the mechanics behind the bucket fill command should be improved to better fill in the gaps of white pixels currently left open at edges where the fill meets the a non-matching color. This behaviour has to be further investigated.
