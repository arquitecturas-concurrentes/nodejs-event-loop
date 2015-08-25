# Ejemplos de Event Loop en Node.js

## Antes de empezar

Instalá un entorno Node como se [explica acá](http://arquitecturas-concurrentes.github.io/guias/node/). La parte de Express la podés obviar. 

## Los ejemplos

### El event loop

El event loop es una estructura muy simple propia de las simulaciones evento a evento de los videojuegos. 

```javascript 
while(true) {
   var event = nextEvent();
   processEvent(event);
   render();
   sleep();
}
```

Como se observa, así se puede modelar procesar diferentes eventos de forma concurrente, sin ningun tipo de thread.  Por eso esta idea se usa también para programar aplicaciones. Sólo que no se usará un sleep, claro. 

### El Reactor, paso 1

Reactor es un patrón de objetos que permite modelar un event loop. En su forma más simple, nos permite agendar tareas para hacer a futuro. 

### El reactor, paso 2

Incorporamos IO async y select. 

### El reactor, paso 3

Incorporamos timers.

### Ejemplos en Node

