import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import useInterval from "./useInterval";
import AppleRed from "./img/apple-red.png";
import AppleGreen from "./img/apple-green.png";
import AppleYellow from "./img/apple-yellow.png";
import AppleBlue from "./img/apple-blue.png";

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

// TO DO
// 1. create function for levels, faster snake for each level
// 2. make sure command that is the opposite of direction will
//    be ignored so you don't die

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snake, setSnake] = useState(initialSnake);
  const [apple, setApple] = useState(initialApple);
  const [direction, setDirection] = useState([0, -1]);
  const [delay, setDelay] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [AppleLogo, setAppleLogo] = useState<string>(AppleRed);
  const [eatenApples, setEatenApples] = useState<string[]>([]);
  const [canvas, setCanvas] = useState<string[]>(["red", "red"]);

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
        else if (eatenApples[0]===AppleYellow) ctx.fillStyle = "#FBFF00";
        snake.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
        ctx.drawImage(fruit, apple[0], apple[1], 1, 1);
      }
    }
  }, [AppleLogo, snake, apple, gameOver, eatenApples]);

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
  }

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
      handleSetScore();
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

  return (
    <div onKeyDown={(e) => changeDirection(e)}>
      <img id="fruit" src={AppleLogo} alt="fruit" width="30" />
      <canvas
        className={canvas[1]}
        ref={canvasRef}
        width={`${screenWidth}px`}
        height={`${screenHeight}px`}
      />
      {gameOver && <div className="gameOver">Game Over</div>}
      <button onClick={play} className="playButton">
        Play
      </button>
      <div className="scoreBox">
        <h2>Score: {score}</h2>
        <h2>High Score: {localStorage.getItem("snakeScore")}</h2>
      </div>
    </div>
  );
}

export default App;
