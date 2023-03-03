import React, { useEffect, useRef, useState } from 'react';
import './App.css';


function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sprites = new Image();
  const hit = new Audio();
  hit.src = require('./assets/audio/efeitos_hit.wav');
  let frames = 0;
  sprites.src = require('./assets/sprites.png');
  const context = canvasRef.current?.getContext('2d');

  const globals: any = {};

  const containsCrash = (data: any, floor: any) => {
    const dataY = data.y + data.height;
    const floorY = floor.y;
    if(dataY >= floorY) {
      return true;
    } 
    return false;
  }

  const createFlappyBird = () => {
    const flappyBird = {
      spriteX: 0,
      spriteY: 0,
      width: 33,
      height: 24,
      x: 10,
      y: 50,
      gravity: 0.25,
      speed: 0,
      jumpValue: 3.5,
      update() {
        if(containsCrash(flappyBird, globals.floor)) {
          // hit.play();
          changeScreen(screens.GAME_OVER);
          return;
        }
        flappyBird.speed = flappyBird.speed + flappyBird.gravity;
        flappyBird.y += flappyBird.speed;
      },
      jump() {
        flappyBird.speed = - flappyBird.jumpValue;
      },
      currentFrame: 0,
      updateFrame() {
        const frameInterval = 10;
        const passedBreak = frames % frameInterval === 0;
        if(passedBreak) {
          const incrementBase = 1;
          const increment = incrementBase + flappyBird.currentFrame;
          const repeatBase = flappyBird.motions.length;
          flappyBird.currentFrame = increment % repeatBase;
        }
      },
      motions: [
        { spriteX: 0, spriteY: 0},
        { spriteX: 0, spriteY: 26},
        { spriteX: 0, spriteY: 52},
      ],
      draw() {
        flappyBird.updateFrame();
        context?.drawImage(
          sprites,
          flappyBird.motions[flappyBird.currentFrame].spriteX, flappyBird.motions[flappyBird.currentFrame].spriteY, // sprite x | sprite y 
          flappyBird.width, flappyBird.height,
          flappyBird.x, flappyBird.y,
          flappyBird.width, flappyBird.height
        );
      }
    }
    return flappyBird;
  }

  const createPipes = () => {
    const pipes = {
      width: 52,
      height: 400,
      pipeFloor: {
        spriteX: 0,
        spriteY: 169,
      },
      pipeSky: {
        spriteX: 52,
        spriteY: 169,
      },
      space: 80,
      listPipes: [] as any,
      draw() {
        pipes.listPipes.forEach((pipe: any) => {
          const yRandom = pipe.y;

          const spaceBetweenPipes = 100;
          const pipeSkyX = pipe.x;
          const pipeSkyY = yRandom;
          context?.drawImage(
            sprites,
            pipes.pipeSky.spriteX, pipes.pipeSky.spriteY, // sprite x | sprite y 
            pipes.width, pipes.height,
            pipeSkyX, pipeSkyY,
            pipes.width, pipes.height
          );
  
          const pipeFloorX = pipe.x;
          const pipeFloorY = pipes.height + spaceBetweenPipes + yRandom;
          context?.drawImage(
            sprites,
            pipes.pipeFloor.spriteX, pipes.pipeFloor.spriteY, // sprite x | sprite y 
            pipes.width, pipes.height,
            pipeFloorX, pipeFloorY,
            pipes.width, pipes.height
          );

          pipe.skyPipe = {
            x: pipeSkyX,
            y: pipes.height + pipeSkyY
          }
          pipe.floorPipe = {
            x: pipeFloorX,
            y: pipeFloorY,
          }
        });
      },
      containsCrashWithFlappyBird(pipe: any) {
        const headBird = globals.flappyBird.y;
        const birdFoot = globals.flappyBird.y + globals.flappyBird.height;
        if((globals.flappyBird.x + globals.flappyBird.width) >= pipe.x) {
          if(headBird <= pipe.skyPipe.y) {
            return true;
          }
  
          if(birdFoot >= pipe.floorPipe.y) {
            return true;
          }
        }
        return false;
      },
      update() {
        const passed100Frames = frames % 100 === 0;
        if(passed100Frames) {
          pipes.listPipes.push({
            x: canvasRef.current?.width ? canvasRef.current.width : 100,
            y: -150 * (Math.random() + 1)
          });
        }
        pipes.listPipes.forEach((pipe: any) => {
          pipe.x = pipe.x - 2;

          if(pipes.containsCrashWithFlappyBird(pipe)) {
            changeScreen(screens.GAME_OVER);
          }

          if(pipe.x + pipes.width <= 0) {
            pipes.listPipes.shift();
          }
        });
      }
    }
    return pipes;
  }

  const createFloor = () => {
    const floor = {
      spriteX: 0,
      spriteY: 610,
      width: 224,
      height: 112,
      x: 0,
      y: canvasRef.current?.height ? canvasRef.current.height - 112 : 112,
      draw() {
        context?.drawImage(
          sprites,
          floor.spriteX, floor.spriteY, // sprite x | sprite y 
          floor.width, floor.height,
          floor.x, floor.y,
          floor.width, floor.height
        );
        context?.drawImage(
          sprites,
          floor.spriteX, floor.spriteY, // sprite x | sprite y 
          floor.width, floor.height,
          (floor.x + floor.width), floor.y,
          floor.width, floor.height
        );
      },
      update() {
        const floorMotion = 1
        const repeat = floor.width / 2;
        const motion = floor.x - floorMotion;
        floor.x = motion % repeat;
      }
    }
    return floor;
  }

  

  const background = {
    spriteX: 390,
    spriteY: 0,
    width: 275,
    height: 204,
    x: 0,
    y: canvasRef.current?.height ? canvasRef.current.height - 204 : 204,
    draw() {
      
      if(context && canvasRef.current) {
        context.fillStyle = '#70c5ce';
        context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }

      context?.drawImage(
        sprites,
        background.spriteX, background.spriteY, // sprite x | sprite y 
        background.width, background.height,
        background.x, background.y,
        background.width, background.height
      );
      context?.drawImage(
        sprites,
        background.spriteX, background.spriteY, // sprite x | sprite y 
        background.width, background.height,
        (background.x + background.width), background.y,
        background.width, background.height
      );
    }
  }

  const getReady = {
    spriteX: 134,
    spriteY: 0,
    width: 174,
    height: 152,
    x: canvasRef.current?.width ? (canvasRef.current.width / 2) - 174 / 2 : 0,
    y: 50,
    draw() {
      context?.drawImage(
        sprites,
        getReady.spriteX, getReady.spriteY, // sprite x | sprite y 
        getReady.width, getReady.height,
        getReady.x, getReady.y,
        getReady.width, getReady.height
      );
    }
  }

  const gameOver = {
    spriteX: 134,
    spriteY: 153,
    width: 226,
    height: 200,
    x: canvasRef.current?.width ? (canvasRef.current.width / 2) - 226 / 2 : 0,
    y: 50,
    draw() {
      context?.drawImage(
        sprites,
        gameOver.spriteX, gameOver.spriteY, // sprite x | sprite y 
        gameOver.width, gameOver.height,
        gameOver.x, gameOver.y,
        gameOver.width, gameOver.height
      );
    }
  }

  let screenActive: any = {};

  const changeScreen = (newScreen: any) => {
    screenActive = newScreen;

    if(screenActive.init) {
      screenActive.init();
    }
  };

  const screens = {
    HOME: {
      init() {
        globals.flappyBird = createFlappyBird();
        globals.floor = createFloor();
        globals.pipes = createPipes();
      },
      draw() {
        background.draw();
        globals.floor.draw();
        getReady.draw();
        globals.flappyBird.draw();
      },
      update() {
        globals.floor.update();
      },
      click() {
        changeScreen(screens.GAME);
      }
    },
    GAME_OVER: {
      draw() {
        gameOver.draw();
      },
      update() {
        
      },
      click() {
        changeScreen(screens.HOME);
      },
    },
    GAME: {
      draw() {
        background.draw();
        globals.pipes.draw();
        globals.floor.draw();
        globals.flappyBird.draw();
      },
      update() {
        globals.pipes.update();
        globals.flappyBird.update();
        globals.floor.update();
      },
      click() {
        globals.flappyBird.jump();
      }
    }
  }

  const loop = () => {
   if(!isLoading) {
    screenActive.draw();
    screenActive.update();
    frames += 1;
    requestAnimationFrame(loop);
   }
  }

  window.addEventListener('click', () => {
    if(screenActive.click) {
      screenActive.click();
    }
  });

  window.addEventListener('keyup', () => {
    if(screenActive.click) {
      screenActive.click();
    }
  });

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  changeScreen(screens.HOME);

  loop();

  return (
    <div className="App">
      <canvas className='canvas' ref={canvasRef} width="320" height="480">

      </canvas>
    </div>
  );
}

export default App;
