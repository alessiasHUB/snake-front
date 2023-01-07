import React, { useCallback, useEffect, useRef, useState } from "react";
import "../App.css";
import useInterval from "./useInterval";
import AppleRed from "../img/apple-red.png";
import AppleGreen from "../img/apple-green.png";
import AppleYellow from "../img/apple-yellow.png";
import AppleBlue from "../img/apple-blue.png";
import axios from "axios";

const screenWidth = 1200;
const screenHeight = 1200;
const initialSnake = [
  [4, 10],
  [4, 10],
];
const initialApple = [14, 10];
const scale = 50;
// bigger number = slower snake
const timeDelay = 110;

interface Highscore {
  id: number;
  highscore: number;
  name: string;
}

export interface IGameProps {}

const url =
  process.env.NODE_ENV === "production"
    ? "https://snake-back.onrender.com"
    : "http://localhost:4000";

const Game: React.FunctionComponent<IGameProps> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snake, setSnake] = useState(initialSnake);
  const [apple, setApple] = useState(initialApple);
  const [direction, setDirection] = useState([0, -1]);
  const [delay, setDelay] = useState<number | null>(timeDelay);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [AppleLogo, setAppleLogo] = useState<string>(AppleRed);
  const [eatenApples, setEatenApples] = useState<string[]>([]);
  const [canvas, setCanvas] = useState<string[]>(["red", "red"]);
  const [highscores, setHighscores] = useState<Highscore[]>([]);
  const [input, setInput] = useState<string>("");
  const [formVis, setFormVis] = useState<boolean>(false);

  //GET highscores from API
  const getHighscores = useCallback(async () => {
    console.log("getHighscores works");
    try {
      const response = await axios.get(url + "/items");
      setHighscores(response.data);
    } catch (error) {
      console.error("Woops... issue with GET request: ", error);
    }
  }, []);

  //POST highscore to API
  const postHighscores = async (newName: string, newScore: number) => {
    console.log("postHighscores function is running!");
    try {
      await axios.post(url + "/items", { name: newName, highscore: newScore });
    } catch (error) {
      console.error("Woops... issue with POST request: ", error);
    }
  };

  useInterval(() => runGame(), delay);

  useEffect(() => {
    let fruit = document.getElementById("fruit") as HTMLCanvasElement;
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        if (eatenApples[0] === AppleRed) ctx.fillStyle = "#FF5100";
        else if (eatenApples[0] === AppleGreen) ctx.fillStyle = "#68FF00";
        else if (eatenApples[0] === AppleBlue) ctx.fillStyle = "#00DCFF";
        else if (eatenApples[0] === AppleYellow) ctx.fillStyle = "#FBFF00";
        snake.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
        ctx.drawImage(fruit, apple[0], apple[1], 1, 1);
      }
    }
    if (gameOver && !formVis) {
      getHighscores();
    }
  }, [
    AppleLogo,
    snake,
    apple,
    gameOver,
    eatenApples,
    input,
    formVis,
    getHighscores,
  ]);

  const handleSubmit = () => {
    console.log(input);
    postHighscores(input, score);
    getHighscores();
    setInput("");
  };
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSubmit();
      setFormVis(false);
    }
  }

  // local storage highscore
  function handleSetScore() {
    if (score > Number(localStorage.getItem("snakeScore"))) {
      localStorage.setItem("snakeScore", JSON.stringify(score));
    }
  }

  function play() {
    setSnake(initialSnake);
    setApple(initialApple);
    setDirection([1, 0]);
    setDelay(timeDelay);
    setScore(0);
    setGameOver(false);
    setFormVis(false);
  }

  // apple rules
  function checkCollision(head: number[]) {
    // Green apple: snake can travel through walls
    if (eatenApples[0] === AppleGreen) {
      for (let i = 0; i < head.length; i++) {
        // if the snake goes through the left/right wall
        if (head[0] < 0) {
          head[0] = screenWidth / scale - 1;
        } else if (head[0] * scale >= screenWidth) {
          head[0] = 0;
        }
        // if the snake goes through the top/bottom wall
        if (head[1] < 0) {
          head[1] = screenHeight / scale - 1;
        } else if (head[1] * scale >= screenHeight) {
          head[1] = 0;
        }
      }
      // when the snake 'eat' itsels -> Game Over!
      for (const s of snake) {
        if (head[0] === s[0] && head[1] === s[1]) return true;
      }
      return false;
    }
    // Blue apple: snake can go through itself
    if (eatenApples[0] === AppleBlue) {
      for (let i = 0; i < head.length; i++) {
        // if the snake hits a wall -> Game Over!
        if (head[i] < 0 || head[i] * scale >= screenWidth) return true;
      }
      for (const s of snake) {
        // if the snake runs into itself -> continue game
        if (head[0] === s[0] && head[1] === s[1]) return false;
      }
      return false;
    }
    // Yellow apple: snake can travel through walls & itself
    if (eatenApples[0] === AppleYellow) {
      for (let i = 0; i < head.length; i++) {
        // if the snake goes through the left/right wall
        if (head[0] < 0) {
          head[0] = screenWidth / scale - 1;
        } else if (head[0] * scale >= screenWidth) {
          head[0] = 0;
        }
        // if the snake goes through the top/bottom wall
        if (head[1] < 0) {
          head[1] = screenHeight / scale - 1;
        } else if (head[1] * scale >= screenHeight) {
          head[1] = 0;
        }
      }
      for (const s of snake) {
        if (head[0] === s[0] && head[1] === s[1]) return false;
      }
      return false;
    }
    // Red apple: snake cannot hit walls or itself
    if (eatenApples[0] === AppleRed) {
      for (let i = 0; i < head.length; i++) {
        // snake hits wall -> Game Over!
        if (head[i] < 0 || head[i] * scale >= screenWidth) return true;
      }
      for (const s of snake) {
        // snake hits itself -> Game Over!
        if (head[0] === s[0] && head[1] === s[1]) return true;
      }
      return false;
    }
  }

  function appleAte(newSnake: number[][]) {
    let coord = apple.map(() =>
      Math.floor((Math.random() * screenWidth) / scale)
    );
    if (newSnake[0][0] === apple[0] && newSnake[0][1] === apple[1]) {
      let newApple = coord;
      setScore(score + 1);
      setApple(newApple);

      // the red apple is most likely, green, blue and yellow least
      let newAppleLogo = AppleRed;
      let num = Math.floor(Math.random() * 20);
      if (num > 10) {
        if (num === 18) newAppleLogo = AppleYellow;
        num % 3 !== 0
          ? (newAppleLogo = AppleGreen)
          : (newAppleLogo = AppleBlue);
      }
      let color = "red";
      if (newAppleLogo === AppleGreen || newAppleLogo === AppleYellow) {
        color = "green";
      } else if (newAppleLogo === AppleBlue) {
        color = "blue";
      }
      setAppleLogo(newAppleLogo);
      setEatenApples((prevApples) => [AppleLogo, ...prevApples]);
      setCanvas((prev) => [color, ...prev]);
      return true;
    }
    return false;
  }

  function runGame() {
    const newSnake = [...snake];
    const newSnakeHead = [
      newSnake[0][0] + direction[0],
      newSnake[0][1] + direction[1],
    ];
    newSnake.unshift(newSnakeHead);
    if (checkCollision(newSnakeHead)) {
      setDelay(null);
      setGameOver(true);
      console.log("game over");
      if (highscores.length < 10 || score > highscores[9].highscore) {
        setFormVis(true);
      }
      handleSetScore();
      getHighscores();
    }
    if (!appleAte(newSnake)) {
      newSnake.pop();
    }
    setSnake(newSnake);
  }

  function changeDirection(e: React.KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case "ArrowLeft" /*
        if (direction !== [1, 0]){*/:
        setDirection([-1, 0]);
        /*}*/
        break;
      case "ArrowUp":
        setDirection([0, -1]);
        break;
      case "ArrowRight":
        setDirection([1, 0]);
        break;
      case "ArrowDown":
        setDirection([0, 1]);
        break;
    }
  }

  // function WhenHighscore(props: {score:number, highscores:Highscore[]}):JSX.Element {
  //   const { score, highscores } = props;
  //   if (gameOver && highscores.length > 9 && score > highscores[9].highscore) {
  //     setFormVis(true)
  //   } else if (gameOver && highscores.length < 9) {
  //     setFormVis(true)
  //   } else if (gameOver) {
  //     setFormVis(false)
  //   }
  //   return (
  //     <>
  //     <div>
  //       <h1>Highscores</h1>
  //       <ol>
  //         {highscores.slice(0,10).map((el) => <li key={el.id}>{el.name}  {el.highscore}</li>)}
  //       </ol>
  //     </div>
  //     {formVis
  //     &&
  //     <>
  //       <h1 className="gameOver" >Congrats you made it on to the top highscores!</h1>
  //       {/* <form id='form' onSubmit={handleSubmit}> */}
  //         <input
  //           type="text"
  //           value={input}
  //           onChange={(e) => setInput(e.target.value)}
  //           onKeyDown={handleKeyDown}
  //           placeholder="Write your name"
  //         />
  //         {/* <span> </span>
  //         <button type="submit" className="add-button">
  //           +
  //         </button>
  //       </form> */}
  //     </>
  //     }
  //     </>
  //   );
  // }

  return (
    <>
      <div onKeyDown={(e) => changeDirection(e)}>
        <img id="fruit" src={AppleLogo} alt="fruit" width="30" />
        <canvas
          className={canvas[1]}
          ref={canvasRef}
          width={`${screenWidth}px`}
          height={`${screenHeight}px`}
        />
        {/* {gameOver && <div className="gameOver">Game Over</div>} */}
        {gameOver && (
          <div className="highscoreList">
            <h1>Highscores</h1>
            <table className="highscoreTable">
              <tbody>
                {highscores.slice(0, 10).map((el, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{el.name}</td>
                    <td>{el.highscore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {formVis && (
          <div>
            <h1 className="inputHighscoreText">
              Congrats you have a top score!
            </h1>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your name"
              maxLength={10}
              className="inputHighscore"
            />
            {input.length > 0 && (
              <h1 className="enterText">Press ENTER to add</h1>
            )}
          </div>
        )}
        <button onClick={play} className="playButton">
          Play
        </button>
        <div className="scoreBox">
          <h2>Score: {score}</h2>
          <h2>High Score: {localStorage.getItem("snakeScore")}</h2>
        </div>
      </div>
    </>
  );
}

export default Game;
